export default async function fetchedData(genre){
    if (genre === "movies") {
        let movies = [];
        const path = "https://image.tmdb.org/t/p/w300";

        for (let i = 1; i <= 10; i++) {
            const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=3d09127832740f0176c6125209f06a79&with_original_language=en|ko&vote_count.gte=10000&page=${i}`);
            const data = await res.json();
            const filtered = data.results.filter(movie =>
                movie.title &&
                movie.title.replace(/\s/g, '').length <= 20 &&
                !/\d/.test(movie.title) 
            );
            movies.push(...filtered);
        }

        return movies.map(movie => ({
            title: movie.title.replace(/[-:.•',]/g, ''), 
            path: `${path}${movie.poster_path}`
        }));
    }

    else if(genre === "anime"){
        let animes = []
        for (let i = 1; i<=4; i++){
            const res = await fetch(`https://api.jikan.moe/v4/anime?page=${i}&limit=25&order_by=popularity&min_score=7`)
            const data = await res.json()
            const filtered = data.data.map(anime => (
                {
                    title : (anime.title_english || anime.title).replace(/[-:;/.'I?!,0-9]/g, ''),
                    path : anime.images.jpg.image_url
                }
            )).filter(anime => 
                !/season/i.test(anime.title) &&
                anime.title.replace(/\s/g, '').length <= 20
            )
            animes.push(...filtered)
        }
        return animes
    }
    else if(genre === "countries"){
        let countries = []
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flags")
        const data = await res.json()
        const filtered = data.map(country => (
            {
                title : (country.name.common).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z\s]/g, ""),
                path : country.flags.png
            }
        )).filter(country => country.title.replace(/\s/g, '').length <= 20)
        countries.push(...filtered)
        return countries
    }
    else if(genre === "drama"){
        const path = "https://image.tmdb.org/t/p/w300";
        let tvshows = [];

        const isEnglish = (str) => /^[\x00-\x7F]*$/.test(str); 

        const cleanTitle = (title) =>
            title
                .replace(/[-:/.'!,0-9]/g, '')
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, '');

        for (let i = 1; i <= 5; i++) {
            const res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=3d09127832740f0176c6125209f06a79&with_original_language=ko&vote_count.gte=300&page=${i}`);
            const data = await res.json();

            const filtered = data.results.map(show => {
                const title = isEnglish(show.name) ? show.name
                            : isEnglish(show.original_name) ? show.original_name
                            : null;
                if (!title || !show.poster_path) return null;

                return {
                    title: cleanTitle(title),
                    path: `${path}${show.poster_path}`
                };
            }).filter(item =>
                item.title.replace(/\s/g, '').length <= 20
            );

            tvshows.push(...filtered);
        }
        for (let i = 1; i <= 3; i++) {
            const res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=3d09127832740f0176c6125209f06a79&with_original_language=en&vote_count.gte=300&page=${i}`);
            const data = await res.json();

            const filtered = data.results.map(show => {
                const title = isEnglish(show.name) ? show.name
                            : isEnglish(show.original_name) ? show.original_name
                            : null;
                if (!title || !show.poster_path) return null;

                return {
                    title: cleanTitle(title),
                    path: `${path}${show.poster_path}`
                };
            }).filter(item =>
                item.title.replace(/\s/g, '').length <= 20
            );

            tvshows.push(...filtered);
        }

        return tvshows
    }
    else if (genre === "music") {
        let music = [];
        const isValidTitle = (title) => {
            const normalized = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return /^[A-Za-z\s]+$/.test(normalized);
        };

        for (let i = 2; i <= 4; i++) {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=0c98d35974b16054cd87b6ab9d52b29d&format=json&page=${i}`);
            const data = await res.json();
            const filtered = data.artists.artist
                .map(a => ({
                    title: a.name,
                    path: ""
                }))
                .filter(a => isValidTitle(a.title));

            music.push(...filtered);
        }

        return music;
    }

    else if(genre==="famus"){
        const path = "https://image.tmdb.org/t/p/w300";
        let people = [];

        const cleanName = (name) =>
            name
                .replace(/[-:/.'!,0-9]/g, '')
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, '');

        for (let i = 1; i <= 5; i++) {
            const res = await fetch(`https://api.themoviedb.org/3/person/popular?api_key=3d09127832740f0176c6125209f06a79&page=${i}`);
            const data = await res.json();

            const filtered = data.results.map(person => {
                if (!person.name || !person.profile_path) return null;

                return {
                    title: cleanName(person.name),
                    path: `${path}${person.profile_path}`
                };
            }).filter(person =>
                person!==null &&
                person.title.replace(/\s/g, '').length <= 20
            );

            people.push(...filtered);
        }

        return people;
    }
    return []
}