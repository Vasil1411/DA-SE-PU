using Microsoft.EntityFrameworkCore;
using WebApi.Entities;
namespace WebApi.Data;

public class FootballForumDbContext : DbContext
    {
        
        public FootballForumDbContext(DbContextOptions<FootballForumDbContext> options)
            : base(options)
        {
        }

        
        public DbSet<User> Users { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<PostLike> PostLikes { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);
            

             modelBuilder.Entity<PostLike>()
            .HasKey(pl => new { pl.UserId, pl.PostId }); 
        
            modelBuilder.Entity<PostLike>()
            .HasOne(pl => pl.User)
            .WithMany(u => u.PostLikes)
            .HasForeignKey(pl => pl.UserId)
            .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<PostLike>()
            .HasOne(pl => pl.Post)
            .WithMany(p => p.PostLikes)
            .HasForeignKey(pl => pl.PostId)
            .OnDelete(DeleteBehavior.Restrict);

    
            modelBuilder.Entity<Post>()
            .HasOne(p => p.Team)
            .WithMany(t => t.Posts)
            .OnDelete(DeleteBehavior.Cascade); 

            
            modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);
            
            
            modelBuilder.Entity<Team>()
            .HasOne(t => t.Creator)      
            .WithMany(u => u.MyTeams)    
            .HasForeignKey(t => t.CreatorId) 
            .OnDelete(DeleteBehavior.Restrict);


            

        }

        
    }
