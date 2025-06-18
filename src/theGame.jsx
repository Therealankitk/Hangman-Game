import { useState, useEffect } from "react"
import { clsx } from "clsx"
import hangdata from "./hangdata"
import gameover from "./assets/game-over.gif"
import score2 from "./assets/score2.gif";
import { qualifiesForTop3, updateHighScores } from "./checkUpdateFirebase"


export default function TheGame({ words, hintTrigger, lifeLost}) { 
    const [currentWord, setCurrentWord] = useState("")
    const [path, setPath] = useState("")
    const [hint, setHint] = useState([])
    const [guess, setGuess] = useState([])
    const [hang, setHang] = useState("")
    const [wrongGuess, setWrongGuess] = useState(0)
    const [isGameLost,setIsGameLost] = useState(false)
    const [lives,setLives] = useState(4)
    const [gameFinished, setGameFinished] = useState(false)
    const [score,setScore] = useState(0)
    const [takeInput,setTakeInput] = useState(false)
    const [playerName,setPlayerName] = useState("")
    let isGameWon = false
    
    useEffect(() => {
        if (words && words.length > 0) {
            const randindx = Math.floor(Math.random() * words.length);
            setCurrentWord(words[randindx].title.toLowerCase());
            setPath(words[randindx].path)
        }
    }, [words])
    
    function newWord(){
        const randindx = Math.floor(Math.random() * words.length);
        setCurrentWord(words[randindx].title.toLowerCase());
        setPath(words[randindx].path)
        setGuess([])
        setHint([])
        setIsGameLost(false)
        setWrongGuess(0)
        isGameWon = false
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
        const hintCount = Math.ceil(currentWord.length * 0.2)
        let i = 0;
        while (i < hintCount) {
            const idx = Math.floor(Math.random() * currentWord.length)
            const letter = currentWord[idx]
            if (letter === " " || hint.includes(letter)) continue
            setHint(prev => [...prev, letter])
            i++
        }
    }, [currentWord])

    useEffect(() => {
        if (!currentWord) return
        const hiddenLetters = currentWord.split("").filter(l => l!== " " && !hint.includes(l) && !guess.includes(l))
        if (hiddenLetters.length > 0) {
            const random = hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)]
            setHint(prev => [...prev, random])
        }
    }, [hintTrigger]) 
    if(currentWord.length > 0){
        isGameWon = currentWord.replace(/\s/g, '').split("").every(letter => guess.includes(letter) || hint.includes(letter))
    }
    
    useEffect(()=>{
        if(isGameWon){
            const bonus = (wrongGuess>0)?(6-wrongGuess):6
            console.log(bonus)
            setScore(prev => prev+bonus)
        }
    },[isGameWon])
    
    function addGuess(letter) {
        setGuess(prev => prev.includes(letter) ? prev : [...prev, letter])
        setWrongGuess(prev => currentWord.includes(letter) ? prev : prev+1)
    }
    
    useEffect(()=>{
        const hangman = hangdata.map((man) => {
            if(man.id === wrongGuess){
                setHang(man.src)
            }
        })
        if(wrongGuess>=6){
            setIsGameLost(true);
            setLives(prev => prev-1);
            lifeLost();
        }
    },[wrongGuess])

    useEffect(()=>{
        if(lives<0){
            setGameFinished(true)
        }
    },[lives])
    
    const gameOver = isGameWon || isGameLost
    
    const letters = currentWord.split("").map((letter, index) => {
        if(letter === " "){
            return (
                <span key={index}className="space"></span>
            )
        }
        if (hint.includes(letter)) {
            return (
                <span key={index} className="letter">
                    {letter.toUpperCase()}
                </span>
            )
        }
        else if(isGameLost){
            const missed = !guess.includes(letter) && !hint.includes(letter)
            return (
                <span key={index} className={`letter ${missed?"rem":""}`}>
                    {letter.toUpperCase()}
                </span>
            )
        }
        else {
            return (
                <span key={index} className="letter">
                    {guess.includes(letter) ? letter.toUpperCase() : ""}
                </span>
            )
        }
    })


    function resetGame(){
        window.location.reload()
    }


    const alphabet = "qwertyuiopasdfghjklzxcvbnm"
    const keyboard = alphabet.split("").map((key, index) => {
        const isGuessed = guess.includes(key)
        const isCorrect = isGuessed && currentWord.includes(key)
        const isWrong = isGuessed && !currentWord.includes(key)

        const className = clsx({
            correct: isCorrect,
            wrong: isWrong,
            key: true
        })
        const className1 = clsx({
            correct: isCorrect,
            wrong: isWrong,
            key: true,
            spec1: true
        })
        const className2 = clsx({
            correct: isCorrect,
            wrong: isWrong,
            key: true,
            spec2: true
        })

        if (key === "a") {
            return <button key={index} className={className1} onClick={() => addGuess(key)} disabled={gameOver}>{key.toUpperCase()}</button>
        } else if (key === "l") {
            return <button key={index} className={className2} onClick={() => addGuess(key)} disabled={gameOver}>{key.toUpperCase()}</button>
        } else {
            return <button key={index} className={className} onClick={() => addGuess(key)} disabled={gameOver}>{key.toUpperCase()}</button>
        }
    })

    async function onGameEnd(finalScore) {
        const qualifies = await qualifiesForTop3(finalScore);
        if (qualifies) {
            setTakeInput(true); 
        }
    }

    useEffect(() => {
        if(takeInput){
            setTimeout(()=>{
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            },200)
        }
    },[takeInput])

    useEffect(() => {
        if (gameFinished) {
            onGameEnd(score);
        }
    }, [gameFinished]);

    async function handleSubmit() {
        await updateHighScores(score,playerName)
        setTakeInput(false)
        alert("High Score submitted")
    }


    const nextBtn = () => {
        if(gameOver && !gameFinished){
            return (
                <button className="next-btn" onClick={newWord}>Next Word</button>
            )
        }
        else if(gameFinished){
            return (
                <button className="next-btn again" onClick={resetGame}>Start Again</button>
            )
        }
    }

    return (
        <div className="game">
            <section className="hangman">
                <img src={!isGameWon?hang:(path!="")?path:hang} alt="poster" />
            </section>
            <section className="word">
                {letters}
            </section>
            <section className="keyboard">
                {keyboard}
            </section>
            {gameFinished && <div className="final"><img src={gameover} alt="over-gif" className="over-gif"/><h4 className="over">Your score: {score}</h4></div>}
            {takeInput && (
                <div className="high-scorer">
                    <img src={score2} alt="score-gif" className="score-gif"/>
                    <div className="takename">
                        <span>What should we call u?</span>
                        <input 
                            type="text"
                            value={playerName}
                            placeholder="Enter your name"
                            onChange={(e) => setPlayerName(e.currentTarget.value)} 
                        />
                        <button onClick={handleSubmit}>Submit</button>
                    </div>
                </div>
            )}
            {nextBtn()}
            {!gameFinished && <h4 className="score">Score: {score}</h4>}
        </div>
    )
}
