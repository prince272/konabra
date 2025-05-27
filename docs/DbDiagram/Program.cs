namespace DbDiagram {
    internal class Program {
        static void Main(string[] args) {
            var factory = new AppDbContextFactory();
            var dbContext = factory.CreateDbContext(args);
            dbContext.Database.EnsureCreated();
        }
    }
}
