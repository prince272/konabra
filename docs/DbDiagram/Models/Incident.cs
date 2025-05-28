using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbDiagram.Models {
    public class Incident {
        public string Id { get; set; } = null!;

        public string Title { get; set; } = null!;

        public string Description { get; set; } = null!;

        public IncidentSeverity Severity { get; set; }

        public IncidentStatus Status { get; set; }

        public DateTime ReportedAt { get; set; }

        public virtual User ReportedBy { get; set; } = null!;

        public string ReportedById { get; set; } = null!;

        public DateTime? ResolvedAt { get; set; }

        public IncidentCategory Category { get; set; } = null!;

        public string CategoryId { get; set; } = null!;

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public string Location { get; set; } = null!;

        public virtual ICollection<IncidentActivity> Activities { get; set; } = new List<IncidentActivity>();
    }

    public enum IncidentStatus {
        Pending,        // Just reported, awaiting review or confirmation
        Investigating,  // Actively being looked into (by community or authorities)
        Resolved,       // Verified and successfully handled
        FalseAlarm      // Invalid report (mistake, spam, or irrelevant)
    }

    public enum IncidentSeverity {
        Low,
        Medium,
        High,
        Critical
    }
}
