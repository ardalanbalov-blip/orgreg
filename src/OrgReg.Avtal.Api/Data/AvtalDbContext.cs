using Microsoft.EntityFrameworkCore;
using OrgReg.Shared.Models.Avtal;

namespace OrgReg.Avtal.Api.Data;

public class AvtalDbContext : DbContext
{
    public AvtalDbContext(DbContextOptions<AvtalDbContext> options) : base(options) { }

    public DbSet<Agreement> Agreements => Set<Agreement>();
    public DbSet<AgreementType> AgreementTypes => Set<AgreementType>();
    public DbSet<Validity> Validities => Set<Validity>();
    public DbSet<Template> Templates => Set<Template>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Agreement>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Name).HasMaxLength(500).IsRequired();
            e.Property(a => a.Description).HasMaxLength(2000);
            e.HasOne(a => a.AgreementType).WithMany().HasForeignKey(a => a.AgreementTypeId);
            e.HasOne(a => a.Validity).WithMany().HasForeignKey(a => a.ValidityId);
            e.HasOne(a => a.Template).WithMany().HasForeignKey(a => a.TemplateId);
            e.HasIndex(a => a.OrganisationId);
        });

        modelBuilder.Entity<AgreementType>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Validity>(e =>
        {
            e.HasKey(v => v.Id);
            e.Property(v => v.RenewalLogic).HasMaxLength(500);
            e.Property(v => v.TerminationCondition).HasMaxLength(500);
        });

        modelBuilder.Entity<Template>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Name).HasMaxLength(500).IsRequired();
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        var pubAvtalType = new AgreementType
        {
            Id = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
            Name = "PUB-avtal",
            Description = "Avtal för publiceringslicenser"
        };

        var samarbetsAvtalType = new AgreementType
        {
            Id = Guid.Parse("b2c3d4e5-f6a7-8901-bcde-f12345678901"),
            Name = "Samarbetsavtal",
            Description = "Avtal för samarbeten"
        };

        modelBuilder.Entity<AgreementType>().HasData(pubAvtalType, samarbetsAvtalType);
    }
}
