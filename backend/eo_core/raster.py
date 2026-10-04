from __future__ import annotations

from pathlib import Path
from typing import Any

import rioxarray


def inspect_raster(path_or_url: str) -> dict[str, Any]:
    """Read raster metadata without forcing a full in-memory load."""
    da = rioxarray.open_rasterio(path_or_url, masked=True, chunks="auto")
    try:
        bounds = da.rio.bounds()
        return {
            "crs": str(da.rio.crs) if da.rio.crs else None,
            "bounds": list(bounds),
            "width": int(da.rio.width),
            "height": int(da.rio.height),
            "bands": int(da.sizes.get("band", 1)),
            "dtype": str(da.dtype),
            "resolution": list(da.rio.resolution()),
            "nodata": da.rio.nodata,
        }
    finally:
        da.close()


def clip_to_geometry(path_or_url: str, geometry: list[dict], crs: str, output_path: str) -> str:
    da = rioxarray.open_rasterio(path_or_url, masked=True, chunks="auto")
    try:
        clipped = da.rio.clip(geometry, crs=crs, drop=True)
        clipped.rio.to_raster(output_path, tiled=True, compress="DEFLATE")
    finally:
        da.close()
    return str(Path(output_path))
