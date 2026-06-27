"""Transfer service for GS LinkOps AI.

Purpose:
- Manage data handover from ground station to satellite operator/manufacturer.
- Track manifest, checksum, destination, confirmation, retry and retention.
- Avoid permanent payload storage by default.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import List, Optional


class TransferStatus(str, Enum):
    waiting_for_file = "Waiting for File"
    file_detected = "File Detected"
    manifest_received = "Manifest Received"
    checksum_pending = "Checksum Pending"
    checksum_verified = "Checksum Verified"
    transfer_started = "Transfer Started"
    transfer_in_progress = "Transfer In Progress"
    transfer_completed = "Transfer Completed"
    operator_confirmed = "Operator / Manufacturer Confirmed"
    temporary_copy_deleted = "Temporary Copy Deleted"
    transfer_closed = "Transfer Closed"
    failed = "Transfer Failed"
    checksum_failed = "Checksum Failed"
    destination_unreachable = "Destination Unreachable"
    cancelled = "Cancelled"


@dataclass
class FileManifestItem:
    filename: str
    size_bytes: int
    checksum: Optional[str] = None


@dataclass
class TransferJobRecord:
    transfer_id: str
    mission_id: str
    source_station_id: str
    destination_organization_id: Optional[str]
    method: str
    source_path: Optional[str] = None
    destination_path: Optional[str] = None
    manifest: List[FileManifestItem] = field(default_factory=list)
    checksum_type: str = "SHA256"
    status: TransferStatus = TransferStatus.waiting_for_file
    retry_count: int = 0
    retention_hours: int = 72
    confirmation_person: Optional[str] = None
    confirmation_time_utc: Optional[str] = None
    created_at_utc: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    @property
    def total_size_bytes(self) -> int:
        return sum(item.size_bytes for item in self.manifest)

    @property
    def auto_delete_due_utc(self) -> str:
        created = datetime.fromisoformat(self.created_at_utc)
        return (created + timedelta(hours=self.retention_hours)).isoformat()


def create_transfer_job(
    transfer_id: str,
    mission_id: str,
    source_station_id: str,
    method: str,
    destination_organization_id: Optional[str] = None,
) -> TransferJobRecord:
    return TransferJobRecord(
        transfer_id=transfer_id,
        mission_id=mission_id,
        source_station_id=source_station_id,
        destination_organization_id=destination_organization_id,
        method=method,
    )


def evaluate_transfer(job: TransferJobRecord) -> dict:
    missing = []
    if not job.method:
        missing.append("transfer method")
    if not job.destination_path:
        missing.append("destination path")
    if not job.manifest:
        missing.append("file manifest")
    if job.manifest and not all(item.checksum for item in job.manifest):
        missing.append("file checksum")
    ready = job.status in {TransferStatus.transfer_completed, TransferStatus.operator_confirmed, TransferStatus.transfer_closed}
    return {
        "transfer_id": job.transfer_id,
        "ready_for_confirmation": not missing,
        "ready_for_billing": job.status in {TransferStatus.operator_confirmed, TransferStatus.transfer_closed},
        "missing": missing,
        "total_size_bytes": job.total_size_bytes,
        "auto_delete_due_utc": job.auto_delete_due_utc,
    }


def mark_operator_confirmed(job: TransferJobRecord, person: str) -> TransferJobRecord:
    job.status = TransferStatus.operator_confirmed
    job.confirmation_person = person
    job.confirmation_time_utc = datetime.now(timezone.utc).isoformat()
    return job
