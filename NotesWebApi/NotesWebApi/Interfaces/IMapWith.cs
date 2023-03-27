using AutoMapper;

namespace NotesWebApi.Interfaces
{
    public interface IMapWith<T> 
    {
        void Mapping(Profile profile) =>
            profile.CreateMap(typeof(T), GetType());
    }
    public record NoteCreateDto(string Title, string Content);
}
