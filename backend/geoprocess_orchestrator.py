from __future__ import annotations
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Protocol
import subprocess, uuid

class SensorFamily(str, Enum):
    OPTICAL='optical'; STEREO='stereo'; SAR='sar'; DEM='dem'; POINT_CLOUD='point_cloud'; UNKNOWN='unknown'
class ComputeClass(str, Enum):
    CPU_SMALL='cpu_small'; CPU_LARGE='cpu_large'; GPU='gpu'; HPC='hpc'

@dataclass
class AssetProbe:
    uri:str; name:str; suffix:str; size_bytes:Optional[int]; sensor_family:SensorFamily; metadata:Dict[str,Any]=field(default_factory=dict); confidence:float=0.0
@dataclass
class ProcessingStep:
    id:str; engine:str; operation:str; compute:ComputeClass; inputs:List[str]; outputs:List[str]; args:Dict[str,Any]=field(default_factory=dict); estimated_weight:float=1.0
@dataclass
class ProcessingPlan:
    job_id:str; probe:AssetProbe; steps:List[ProcessingStep]; final_products:List[str]; requires_review:bool=False; notes:List[str]=field(default_factory=list)
class ComputeBackend(Protocol):
    def submit(self, plan:ProcessingPlan)->Dict[str,Any]: ...

class LocalSubprocessBackend:
    ALLOWED={'gdal_translate','gdalwarp','otbcli_OrthoRectification','gpt','parallel_stereo','point2dem','pdal'}
    def __init__(self,dry_run:bool=True): self.dry_run=dry_run
    def submit(self,plan:ProcessingPlan)->Dict[str,Any]:
        commands=[command_for_step(s) for s in plan.steps]
        if self.dry_run: return {'status':'planned','backend':'local','job_id':plan.job_id,'commands':commands}
        results=[]
        for cmd in commands:
            if Path(cmd[0]).name not in self.ALLOWED: raise RuntimeError(f'blocked command: {cmd}')
            p=subprocess.run(cmd,check=True,capture_output=True,text=True)
            results.append({'cmd':cmd,'stdout':p.stdout[-4000:],'stderr':p.stderr[-4000:]})
        return {'status':'completed','backend':'local','job_id':plan.job_id,'results':results}

class ExternalComputeBackend:
    def __init__(self,submitter): self.submitter=submitter
    def submit(self,plan:ProcessingPlan)->Dict[str,Any]:
        return self.submitter({'schema':'gs.geoprocess.plan.v1','plan':plan_to_dict(plan)})

def _classify_name(name:str):
    n=name.lower()
    if any(x in n for x in ['stereo','left','right','rpc','forward','backward']): return SensorFamily.STEREO,.72
    if any(x in n for x in ['sar','sentinel-1','s1a','s1b','slc','grd']): return SensorFamily.SAR,.78
    if any(x in n for x in ['dsm','dtm','dem','elevation']): return SensorFamily.DEM,.85
    if any(x in n for x in ['.las','.laz','pointcloud','point_cloud']): return SensorFamily.POINT_CLOUD,.9
    if any(x in n for x in ['pan','multispectral','rgb','ortho','image','optical','sentinel-2','landsat','superview','pleiades','worldview','gf']): return SensorFamily.OPTICAL,.62
    return SensorFamily.UNKNOWN,.15

def probe_asset(uri:str,metadata:Optional[Dict[str,Any]]=None)->AssetProbe:
    metadata=dict(metadata or {})
    p=Path(uri); size=p.stat().st_size if p.exists() and p.is_file() else None
    fam,confidence=_classify_name(p.name or uri)
    text=' '.join(str(v) for v in metadata.values()).lower()
    if any(k in text for k in ['sar','synthetic aperture','grd','slc']): fam,confidence=SensorFamily.SAR,max(confidence,.95)
    if any(k in text for k in ['stereo','rpc','epipolar']): fam,confidence=SensorFamily.STEREO,max(confidence,.95)
    return AssetProbe(uri,p.name or uri,''.join(p.suffixes[-2:]),size,fam,metadata,confidence)

def build_plan(probe:AssetProbe,requested:Optional[Iterable[str]]=None)->ProcessingPlan:
    jid=f'geo-{uuid.uuid4().hex[:12]}'; src=probe.uri; steps=[]; out=[]
    if probe.sensor_family==SensorFamily.STEREO:
        steps=[
            ProcessingStep('stereo_match','asp','parallel_stereo',ComputeClass.HPC,[src],['work/pointcloud-PC.tif'],{'alignment':'affineepipolar'},5),
            ProcessingStep('dsm','asp','point2dem',ComputeClass.CPU_LARGE,['work/pointcloud-PC.tif'],['products/DSM.tif'],{'tr':0.8},3),
            ProcessingStep('dom','gdal','gdalwarp',ComputeClass.CPU_LARGE,[src],['products/DOM.tif'],{'target_resolution':0.8},2),
            ProcessingStep('cog_dsm','gdal','gdal_translate',ComputeClass.CPU_SMALL,['products/DSM.tif'],['products/DSM_COG.tif'],{'of':'COG'},1),
            ProcessingStep('cog_dom','gdal','gdal_translate',ComputeClass.CPU_SMALL,['products/DOM.tif'],['products/DOM_COG.tif'],{'of':'COG'},1)]
        out=['products/DSM_COG.tif','products/DOM_COG.tif']
    elif probe.sensor_family==SensorFamily.SAR:
        steps=[ProcessingStep('sar_graph','snap','gpt',ComputeClass.CPU_LARGE,[src],['products/SAR_TC.tif'],{'graph':'graphs/sar_calibrate_terrain_correct.xml'},4),
               ProcessingStep('sar_cog','gdal','gdal_translate',ComputeClass.CPU_SMALL,['products/SAR_TC.tif'],['products/SAR_TC_COG.tif'],{'of':'COG'},1)]
        out=['products/SAR_TC_COG.tif']
    elif probe.sensor_family==SensorFamily.POINT_CLOUD:
        steps=[ProcessingStep('pointcloud','pdal','pdal',ComputeClass.CPU_LARGE,[src],['products/terrain.tif'],{'pipeline':'pipelines/pointcloud_to_dtm.json'},4)]
        out=['products/terrain.tif']
    else:
        steps=[ProcessingStep('ortho','otb','otbcli_OrthoRectification',ComputeClass.CPU_LARGE,[src],['products/ORTHO.tif'],{},3),
               ProcessingStep('cog','gdal','gdal_translate',ComputeClass.CPU_SMALL,['products/ORTHO.tif'],['products/ORTHO_COG.tif'],{'of':'COG'},1)]
        out=['products/ORTHO_COG.tif']
    review=probe.sensor_family==SensorFamily.UNKNOWN or probe.confidence<.5
    notes=['sensor classification confidence is low; metadata review required before paid compute'] if review else []
    return ProcessingPlan(jid,probe,steps,out,review,notes)

def command_for_step(step:ProcessingStep)->List[str]:
    op=step.operation; i=step.inputs[0] if step.inputs else ''; o=step.outputs[0] if step.outputs else ''
    if op=='gdal_translate': return ['gdal_translate','-of',step.args.get('of','COG'),i,o]
    if op=='gdalwarp':
        tr=str(step.args.get('target_resolution',0.8)); return ['gdalwarp','-tr',tr,tr,'-r','cubic',i,o]
    if op=='otbcli_OrthoRectification': return ['otbcli_OrthoRectification','-io.in',i,'-io.out',o]
    if op=='gpt': return ['gpt',step.args['graph'],'-Pinput='+i,'-Poutput='+o]
    if op=='parallel_stereo': return ['parallel_stereo','--alignment-method',step.args.get('alignment','affineepipolar'),i,'work/stereo']
    if op=='point2dem': return ['point2dem',i,'--tr',str(step.args.get('tr',0.8)),'-o','products/DSM']
    if op=='pdal': return ['pdal','pipeline',step.args['pipeline']]
    raise ValueError(op)

def plan_to_dict(plan:ProcessingPlan)->Dict[str,Any]:
    d=asdict(plan); d['probe']['sensor_family']=plan.probe.sensor_family.value
    for s in d['steps']: s['compute']=s['compute'].value if hasattr(s['compute'],'value') else s['compute']
    return d

def create_job(uri:str,metadata:Optional[Dict[str,Any]]=None,requested:Optional[Iterable[str]]=None)->Dict[str,Any]:
    return plan_to_dict(build_plan(probe_asset(uri,metadata),requested))
