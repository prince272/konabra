using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbDiagram.Models {
    public class User {
        [Key]
        public string Id { get; set; } = null!;

        public string FirstName { get; set; } = null!;

        public string LastName { get; set; } = null!;

        public string UserName { get; set; } = null!;

        public string Email { get; set; } = null!;

        public bool EmailVerified { get; set; }

        public string PhoneNumber { get; set; } = null!;

        public bool PhoneNumberVerified { get; set; }

        public string SecurityStamp { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public bool HasPassword { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public DateTime LastActiveAt { get; set; }

        public DateTime LastPasswordChangedAt { get; set; }

        public virtual ICollection<Role> Roles { get; set; } = new List<Role>();

        public List<string> RoleNames() {
            var roleNames = new List<string>();
            foreach (var role in Roles) {
                roleNames.Add(role.Name);
            }
            return roleNames;
        }
    }

    public enum UserType {
        Regular,
        Authority,
        Volunteer,
    }
}