import TheGame from "./theGame"
import { useState, useEffect, useRef } from "react"
import fheart from "./assets/full-heart.png"
import bheart from "./assets/broken-heart.png"
import onbulb from "./assets/on-bulb.png"
import offbulb from "./assets/off-bulb.png"
import fetchedData from "./dataFetch"
import { db, ref, get } from "./firebase";

export default function App() {
    const [lives, setLives] = useState(4)
    const [hints, setHints] = useState(10)
    const [genre, setGenre] = useState("")
    const [data, setData] = useState([])
    const [startGame, setStartGame] = useState(false)
    const [hintTrigger, setHintTrigger] = useState(0)
    const [highScores, setHighScores] = useState([]);

    useEffect(() => {
        async function fetchHighScores() {
            try {
                const snapshot = await get(ref(db, "highscores"));
                if (snapshot.exists()) {
                    const scores = snapshot.val();
                    const sorted = scores.sort((a, b) => b.score - a.score).slice(0, 3);
                    setHighScores(sorted);
                }
            } catch (err) {
                console.error("Error fetching scores:", err);
            }
        }
        fetchHighScores();
    }, []); 

    const hearts = [...Array(4)].map((_, index) => {
        const isFull = index < lives
        return (
            <img key={index} src={isFull ? fheart : bheart} alt={isFull ? "full heart" : "broken heart"} />
        )
    })

    function provideHint() {
        if (hints > 0) {
            setHints(prev => prev - 1)
            setHintTrigger(prev => prev + 1) 
        }
    }
    const updateLives = () => {
        setLives(prev => prev-1)
    }

    const bulbs = () => {
        return (
            <div className="hints">
                <img
                    src={hints > 0 ? onbulb : offbulb}
                    alt={hints > 0 ? "bulb on" : "bulb off"}
                    onClick={provideHint} 
                    style={{ cursor: hints > 0 ? "pointer" : "default" }}
                />
                {hints > 0 ? `x${hints}` : ``}
            </div>
        )
    }

    function genreSelected(event) {
        const genre = event.currentTarget.value
        setGenre(genre)
        setLives(4)
        setHints(10)
        setHintTrigger(0)
        setData([])
        setStartGame(false)
    }

    useEffect(() => {
        if(genre !== ""){
            async function fetchAndSet() {
                const fetched = await fetchedData(genre)
                setData(fetched)
            }
            fetchAndSet()
            setStartGame(true)
        }
    }, [genre])


    return (
        <>
            <div className="lives-hints">
                <div className="lives">
                    {hearts}
                </div>
                <div className="top-banner">
                    <div className="banner-content">
                        {highScores.map((player, idx) => (
                        <span key={idx}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {player.name} - {player.score}&nbsp;&nbsp;&nbsp;
                        </span>
                        ))}
                    </div>
                </div>
                {bulbs()}
            </div>
            <main>
                <header>
                    <h1>Hangman</h1>
                    <p>Guess the word under 6 attempts. Test your knowledge across fun categories like movies, anime, and more.</p>
                </header>
                <div className="genre-select">
                    <label>Choose a Genre:</label>
                    <select name="genre" className="genre" onChange={genreSelected} value={genre}>
                        <option value="" disabled hidden>Select a Genre...</option>
                        <option value="movies">Movies</option>
                        <option value="countries">Countries</option>
                        <option value="anime">Anime</option>
                        <option value="drama">Tv shows & Dramas</option>
                        <option value="famus">Celebrities</option>
                        <option value="music">Music</option>
                    </select>
                </div>
                {startGame && <TheGame words={data} hintTrigger={hintTrigger} lifeLost={updateLives}/>} 
            </main>
        </>
    )
}
