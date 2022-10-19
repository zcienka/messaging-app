using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    public class ApiResult<T>
    {
        public int Count { get; private set; }
        public string? Next { get; private set; } = null;
        public string? Previous { get; private set; } = null;
        public List<T> Results { get; private set; }

        private ApiResult(
            int count,
            string? next,
            string? previous,
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
            var totalCount = await source.CountAsync();
            source = source
                .Skip(offset)
                .Take(limit);

            var previous = (string?)null;
            var next = (string?)null;

            if (totalCount != 0 && limit > 0 && offset >= 0)
            {
                if (offset + limit < totalCount)
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
            }

            var results = await source.ToListAsync();

            return new ApiResult<T>(
                totalCount,
                next,
                previous,
                results);
        }
    }
}