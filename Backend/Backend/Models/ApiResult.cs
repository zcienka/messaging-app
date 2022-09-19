using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    public class ApiResult<T>
    {
        public int Count { get; private set; }
        public string Next { get; private set; }
        public string Previous { get; private set; }
        public List<T> Results { get; private set; }

        private ApiResult(
            int count,
            string next,
            string previous,
            List<T> results)
        {
            Count = count;
            Next = next;
            Previous = previous;
            Results = results;
        }

        public static async Task<ApiResult<T>> CreateAsync(
            IQueryable<T> source,
            int offset,
            int limit,
            string url)
        {
            var count = await source.CountAsync();
            source = source
                .Skip(offset)
                .Take(limit);

            string previous = "null";
            string next = "null";

            if (offset + limit < count)
            {
                next = url + $"?limit={limit}&offset={offset + limit}";
            }

            if (offset > 0)
            {
                if (offset - limit > 0)
                {
                    previous = url + $"?limit={limit}&offset={offset - limit}";
                }
                else
                {
                    previous = url + $"?limit={limit}&offset={0}";
                }
            }
            var results = await source.ToListAsync();

            return new ApiResult<T>(
                count,
                next,
                previous,
                results);
        }
    }
}