using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesWebApi.Interfaces;
using System.Reflection;

namespace NotesWebApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddAutoMapper(cfg =>
             {
                 cfg.AddProfile(new AssemblyMappingProfile(Assembly.GetExecutingAssembly()));
             });
            builder.Services.AddDbContext<NoteContext>(options =>
            {
                options.UseInMemoryDatabase("NoteDB");
            }) ;
            builder.Services.AddAuthorization();

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy(name: "AnyCors",
                    policy =>
                    {
                        policy.AllowAnyHeader();
                        policy.AllowAnyOrigin();
                        policy.AllowAnyMethod();
                    });
            });
            var app = builder.Build();
            app.UseCors("AnyCors");
            app.MapGet("/notes", async ([FromServices] NoteContext db) =>
            {
                var notes = await db.Notes.ToListAsync();
                return Results.Ok(notes);
            });

            app.MapGet("/notes/{id}", async ([FromServices] NoteContext db, [FromQuery] Guid id) =>
            {
                var note = await db.Notes.FindAsync(id);
                return note != null ? Results.Ok(note) : Results.NotFound();
            });

            app.MapPost("/notes", async ([FromServices] NoteContext db, [FromBody] NoteCreateDto noteDto) =>
            {
                Note note = new Note
                {
                    Id = Guid.NewGuid(),
                    Title = noteDto.Title,
                    Description = noteDto.Description,
                    Created = DateTime.UtcNow
                };
                db.Notes.Add(note);
                await db.SaveChangesAsync();
                return Results.Created($"/notes/{note.Id}", note);
            });

            app.MapPut("/notes/{id}", async ([FromServices] NoteContext db, [FromQuery] Guid id, [FromBody] Note note) =>
            {
                if (id != note.Id) return Results.BadRequest("Id mismatch");
                var existingNote = await db.Notes.FindAsync(id);
                if (existingNote == null) return Results.NotFound();
                existingNote.Title = note.Title;
                existingNote.Description = note.Description;
                await db.SaveChangesAsync();
                return Results.Ok(existingNote);
            });

            app.MapDelete("/notes/{id}", async ([FromServices] NoteContext db, [FromQuery] Guid id) =>
            {
                var note = await db.Notes.FindAsync(id);
                if (note == null) return Results.NotFound();
                db.Notes.Remove(note);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });


            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.Run();
        }
    }
    public class Note
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Created { get; set; }
        //public DateTime { get; set; }
    }
    public class NoteCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class NoteContext : DbContext
    {
        public NoteContext(DbContextOptions<NoteContext> options) : base(options) { }
        public DbSet<Note> Notes { get; set; }
    }
}