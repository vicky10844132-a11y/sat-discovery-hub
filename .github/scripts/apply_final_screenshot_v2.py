#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import sys
from pathlib import Path

V1_SHA256 = "b204eeb0a956e981dad9abfbed432deac79dda3c74f865c81fc0cc586c46d082"
V2_SHA256 = "44707fdd341562d314ee8904f17b616570b7876c7cb405a4a41a37111070ad5c"

OLD_BADGE = "    var badge=document.getElementById('globalOrderNotify');if(badge)badge.dataset.count='2';\n"
NEW_BADGE = "    document.querySelectorAll('.rail-notify').forEach(function(badge){badge.dataset.count='2'});\n"

OLD_MAP = """    try{
      if(typeof map!=='undefined'&&map&&map._mapPane){
        setTimeout(function(){
          try{
            if(map.__screenshotUserInteracted)return;
            var scale=1.0998103275672169;
            var globalTx=-57.2395445;
            var globalTy=-34.809153;
            var mapStage=document.querySelector('.mapstage');
            if(!mapStage)return;
            var rect=mapStage.getBoundingClientRect();
            var panePosition=map._mapPane._leaflet_pos||{x:0,y:0};
            var tx=scale*panePosition.x+globalTx+(scale-1)*rect.x;
            var ty=scale*panePosition.y+globalTy+(scale-1)*rect.y;
            map._mapPane.style.transformOrigin='0 0';
            map._mapPane.style.transform='matrix('+scale+',0,0,'+scale+','+tx+','+ty+')';
            map.__screenshotTransformApplied=true;
          }catch(ignore){}
        },120);
        if(stage&&!stage.dataset.screenshotMapRestoreBound){
          var restoreMapInteraction=function(){
            try{
              map.__screenshotUserInteracted=true;
              if(map.__screenshotTransformApplied&&map._mapPane){
                var panePosition=map._mapPane._leaflet_pos||{x:0,y:0};
                map._mapPane.style.transformOrigin='';
                if(window.L&&L.DomUtil&&typeof L.DomUtil.setPosition==='function')L.DomUtil.setPosition(map._mapPane,panePosition);
                else map._mapPane.style.transform='translate3d('+panePosition.x+'px,'+panePosition.y+'px,0)';
                map.__screenshotTransformApplied=false;
                if(typeof map.invalidateSize==='function')map.invalidateSize({animate:false,pan:false});
              }
            }catch(ignore){}
          };
          ['pointerdown','touchstart','wheel'].forEach(function(type){stage.addEventListener(type,restoreMapInteraction,{capture:true,passive:true})});
          stage.dataset.screenshotMapRestoreBound='1';
        }
      }
    }catch(e){}
"""

NEW_MAP = """    try{
      if(typeof map!=='undefined'&&map&&map._mapPane){
        if(map.__screenshotApplyTimer)clearTimeout(map.__screenshotApplyTimer);
        if(!map.__screenshotUserInteracted){
          try{
            map.stop();
            if(map.__screenshotTransformApplied){
              var basePosition=map._mapPane._leaflet_pos||{x:0,y:0};
              map._mapPane.style.transformOrigin='';
              if(window.L&&L.DomUtil&&typeof L.DomUtil.setPosition==='function')L.DomUtil.setPosition(map._mapPane,basePosition);
              else map._mapPane.style.transform='translate3d('+basePosition.x+'px,'+basePosition.y+'px,0)';
              map.__screenshotTransformApplied=false;
            }
            if(typeof map.invalidateSize==='function')map.invalidateSize({animate:false,pan:false});
            if(typeof showAOI==='function')showAOI('kenya');
            if(typeof currentTile!=='undefined'&&currentTile&&typeof currentTile.redraw==='function')currentTile.redraw();
          }catch(ignore){}
          map.__screenshotApplyTimer=setTimeout(function(){
            try{
              if(map.__screenshotUserInteracted)return;
              if(typeof map.invalidateSize==='function')map.invalidateSize({animate:false,pan:false});
              if(typeof showAOI==='function')showAOI('kenya');
              var scale=1.0998103275672169;
              var globalTx=-57.2395445;
              var globalTy=-34.809153;
              var mapStage=document.querySelector('.mapstage');
              if(!mapStage)return;
              var rect=mapStage.getBoundingClientRect();
              var panePosition=map._mapPane._leaflet_pos||{x:0,y:0};
              var tx=scale*panePosition.x+globalTx+(scale-1)*rect.x;
              var ty=scale*panePosition.y+globalTy+(scale-1)*rect.y;
              map._mapPane.style.transformOrigin='0 0';
              map._mapPane.style.transform='matrix('+scale+',0,0,'+scale+','+tx+','+ty+')';
              map.__screenshotTransformApplied=true;
            }catch(ignore){}
          },180);
        }
        if(stage&&!stage.dataset.screenshotMapRestoreBound){
          var restoreMapInteraction=function(){
            try{
              map.__screenshotUserInteracted=true;
              if(map.__screenshotApplyTimer)clearTimeout(map.__screenshotApplyTimer);
              if(map.__screenshotTransformApplied&&map._mapPane){
                var panePosition=map._mapPane._leaflet_pos||{x:0,y:0};
                map._mapPane.style.transformOrigin='';
                if(window.L&&L.DomUtil&&typeof L.DomUtil.setPosition==='function')L.DomUtil.setPosition(map._mapPane,panePosition);
                else map._mapPane.style.transform='translate3d('+panePosition.x+'px,'+panePosition.y+'px,0)';
                map.__screenshotTransformApplied=false;
                if(typeof map.invalidateSize==='function')map.invalidateSize({animate:false,pan:false});
              }
            }catch(ignore){}
          };
          ['pointerdown','touchstart','wheel'].forEach(function(type){stage.addEventListener(type,restoreMapInteraction,{capture:true,passive:true})});
          stage.dataset.screenshotMapRestoreBound='1';
        }
      }
    }catch(e){}
"""


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: apply_final_screenshot_v2.py <data-search-restored.html>", file=sys.stderr)
        return 2

    path = Path(sys.argv[1])
    text = path.read_text(encoding="utf-8")
    before = sha256_text(text)

    if before == V2_SHA256:
        print(f"Final screenshot v2 already present: {before}")
        return 0
    if before != V1_SHA256:
        print(f"Unexpected source SHA-256: {before}", file=sys.stderr)
        return 1
    if text.count(OLD_BADGE) != 1:
        print(f"Expected one badge block, found {text.count(OLD_BADGE)}", file=sys.stderr)
        return 1
    if text.count(OLD_MAP) != 1:
        print(f"Expected one map block, found {text.count(OLD_MAP)}", file=sys.stderr)
        return 1

    text = text.replace(OLD_BADGE, NEW_BADGE, 1)
    text = text.replace(OLD_MAP, NEW_MAP, 1)
    after = sha256_text(text)
    if after != V2_SHA256:
        print(f"Final SHA-256 mismatch: {after}", file=sys.stderr)
        return 1

    path.write_text(text, encoding="utf-8")
    print(f"Applied live-stable screenshot v2: {after}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
