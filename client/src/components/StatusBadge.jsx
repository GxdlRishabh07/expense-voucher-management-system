import React from 'react';
import { Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';

export function StatusBadge({ status }) {
  switch (status) {
    case 'Draft':
      return (
        <span className="badge badge-draft" data-testid={`badge-${status}`}>
          <FileEdit size={13} />
          Draft
        </span>
      );
    case 'Pending Approval':
      return (
        <span className="badge badge-pending" data-testid={`badge-${status}`}>
          <Clock size={13} />
          Pending Approval
        </span>
      );
    case 'Approved':
      return (
        <span className="badge badge-approved" data-testid={`badge-${status}`}>
          <CheckCircle2 size={13} />
          Approved
        </span>
      );
    case 'Rejected':
      return (
        <span className="badge badge-rejected" data-testid={`badge-${status}`}>
          <XCircle size={13} />
          Rejected
        </span>
      );
    default:
      return <span className="badge badge-draft">{status}</span>;
  }
}
