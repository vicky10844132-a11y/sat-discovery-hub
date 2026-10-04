from __future__ import annotations

import pystac

from .models import EOScene


def scene_to_stac_item(scene: EOScene) -> pystac.Item:
    props = {
        "provider": scene.provider,
        "platform": scene.satellite,
        "instruments": [scene.sensor] if scene.sensor else None,
        "gsd": scene.resolution_m,
        "eo:cloud_cover": scene.cloud_cover_pct,
        "view:off_nadir": scene.off_nadir_deg,
        "product:level": scene.product_level,
        "license": scene.license,
        "gs:price": scene.price,
        "gs:currency": scene.currency,
        "gs:availability": scene.availability,
        **scene.extra,
    }
    props = {k: v for k, v in props.items() if v is not None}

    item = pystac.Item(
        id=scene.scene_id,
        geometry=scene.geometry,
        bbox=scene.bbox,
        datetime=scene.acquisition_time,
        properties=props,
    )

    for key, asset in scene.assets.items():
        item.add_asset(
            key,
            pystac.Asset(
                href=asset.href,
                title=asset.title,
                media_type=asset.media_type,
                roles=asset.roles or None,
            ),
        )

    return item


def validate_stac_item(item: pystac.Item) -> None:
    """Run PySTAC validation before an item can enter the governed catalog."""
    item.validate()
