using DbDiagram.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace DbDiagram {
    public class AppDbContext : DbContext {
        public AppDbContext(DbContextOptions options) : base(options) {
        }

        protected AppDbContext() {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);

            var appDbContextType = typeof(AppDbContext);
            var fullNamespace = appDbContextType.Namespace;
            var assembly = appDbContextType.Assembly;

            var baseNamespace = fullNamespace?.Split('.')[0];
            var modelTypes = assembly.ExportedTypes
                .Where(t => t.IsClass && !t.IsAbstract && t.Namespace == $"{baseNamespace}.Models")
                .ToList();

            foreach (var type in modelTypes) {
                modelBuilder.Entity(type);
            }
        }
    }
}
