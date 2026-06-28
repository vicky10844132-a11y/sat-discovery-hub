# GS LinkOps AI — Cloud Storage Strategy and Software Size Boundary

## 1. Core Point

The software platform itself does not need to be physically large.

The large-scale part of satellite downlink business is not the dispatch software. The large-scale part is:

```text
payload data storage
large file transfer
long-term archive
high-throughput distribution
customer download infrastructure
backup and disaster recovery
```

GS LinkOps AI should remain a lightweight dispatch and metadata platform.

---

## 2. Platform Boundary

GS LinkOps AI stores operational metadata, not heavy payload data.

The platform should store:

```text
Demand records
Satellite profiles
Ground station profiles
Station capability metadata
Mission profiles
Pass windows
Booking records
Reception status
Delivery references
Report records
Billing records
Audit logs
Lessons learned
```

The platform should not store by default:

```text
Raw X-band payload data
Large satellite image files
Long-term production archive
Customer data packages
Full historical data repository
```

---

## 3. Cloud Storage Can Be Used Later

If the business needs data storage later, cloud storage can be added as an external storage layer.

Possible storage modes:

```text
ST / partner-managed storage
Cloud object storage
Customer-designated storage
Hybrid storage
Temporary mission storage only
```

The key is that GS LinkOps AI should store references to files, not necessarily the files themselves.

Examples:

```text
storage_provider
bucket_name or storage zone
object_path
SFTP path
file manifest
checksum
expiry date
recipient
delivery confirmation
```

---

## 4. Recommended Architecture

```text
GS LinkOps AI
  ↓ stores metadata only
Mission / delivery database
  ↓ references file location
ST temporary storage / SFTP / cloud object storage
  ↓ transfers to
Satellite operator / customer / designated recipient
```

This keeps the dispatch platform small and inexpensive.

---

## 5. Why This Saves Cost

The owner avoids building immediately:

```text
large storage clusters
high-bandwidth data center
customer download portal
24/7 storage operations
large backup system
full data lifecycle management system
```

Instead, the owner builds:

```text
dispatch logic
resource matching
readiness gate
reporting
billing
delivery tracking
AI-assisted operation
```

Storage can be added only when business volume justifies it.

---

## 6. Future Cloud Storage Options

The platform should be designed to support storage connectors later.

Potential connector types:

```text
SFTP
S3-compatible object storage
AWS S3
Azure Blob Storage
Google Cloud Storage
ST-managed storage
Customer-managed storage
Private NAS / object storage
```

The platform should not be locked to one provider.

---

## 7. Data Delivery Record

A delivery record should include:

```text
Delivery ID
Mission ID
Storage provider
Temporary or permanent storage
File path / object path / SFTP path
File name
File size
Checksum
Manifest
Retention period
Recipient
Transfer status
Recipient confirmation
Billing trigger status
```

This allows GS LinkOps AI to know the delivery truth without hosting the data.

---

## 8. Storage Mode Status

Each mission can have a storage mode:

```text
No Payload Storage — metadata only
ST Temporary Storage
ST Managed Delivery
Cloud Temporary Storage
Cloud Permanent Archive
Customer Managed Storage
Hybrid
```

The initial recommended mode is:

```text
ST Temporary Storage + SFTP Retrieval / ST Managed Delivery
```

---

## 9. Important Product Rule

```text
The platform must be storage-aware, but not storage-heavy.
```

This means:

```text
It knows where the data is.
It knows whether the data was delivered.
It knows who confirmed delivery.
It knows whether billing can happen.
But it does not need to hold the full payload data.
```

---

## 10. Product Conclusion

GS LinkOps AI can stay small and cost-efficient because it is a dispatch, coordination, reporting and billing platform.

Large-scale storage and distribution can be handled by ST, partner stations or cloud storage.

The system should be designed with storage connectors from the beginning, but the first operational version should remain metadata-first and asset-light.
