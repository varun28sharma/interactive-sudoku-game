"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, RotateCcw, Play, Pause } from "lucide-react"

// Initial Sudoku puzzle (0 represents empty cells)
const initialPuzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
]

export default function SudokuGame() {
  const [grid, setGrid] = useState(initialPuzzle.map((row) => [...row]))
  const [originalGrid] = useState(initialPuzzle.map((row) => [...row]))
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [isComplete, setIsComplete] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [score, setScore] = useState(0)
  const [bestScores, setBestScores] = useState<Array<{ time: number; score: number; date: string }>>([])

  // Load best scores from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sudoku-best-scores")
    if (saved) {
      setBestScores(JSON.parse(saved))
    }
  }, [])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isComplete])

  // Check if move is valid according to Sudoku rules
  const isValidMove = useCallback((grid: number[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (i !== col && grid[row][i] === num) return false
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (i !== row && grid[i][col] === num) return false
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if ((i !== row || j !== col) && grid[i][j] === num) return false
      }
    }

    return true
  }, [])

  // Check if puzzle is complete
  const checkCompletion = useCallback((grid: number[][]) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) return false
      }
    }
    return true
  }, [])

  // Calculate score based on time and mistakes
  const calculateScore = useCallback((time: number, mistakes: number) => {
    const baseScore = 10000
    const timePenalty = Math.floor(time / 10) * 10
    const mistakePenalty = mistakes * 100
    return Math.max(baseScore - timePenalty - mistakePenalty, 100)
  }, [])

  // Handle cell input
  const handleCellInput = (row: number, col: number, value: string) => {
    if (originalGrid[row][col] !== 0) return // Can't edit pre-filled cells

    const num = Number.parseInt(value) || 0
    if (num < 0 || num > 9) return

    const newGrid = grid.map((r) => [...r])
    newGrid[row][col] = num

    const cellKey = `${row}-${col}`
    const newErrors = new Set(errors)

    if (num !== 0) {
      if (!isValidMove(newGrid, row, col, num)) {
        newErrors.add(cellKey)
        setMistakes((prev) => prev + 1)
      } else {
        newErrors.delete(cellKey)
      }
    } else {
      newErrors.delete(cellKey)
    }

    setGrid(newGrid)
    setErrors(newErrors)

    // Check completion
    if (checkCompletion(newGrid) && newErrors.size === 0) {
      setIsComplete(true)
      setIsPlaying(false)
      const finalScore = calculateScore(timer, mistakes)
      setScore(finalScore)

      // Save to best scores
      const newScore = {
        time: timer,
        score: finalScore,
        date: new Date().toLocaleDateString(),
      }
      const updatedScores = [...bestScores, newScore].sort((a, b) => b.score - a.score).slice(0, 5)
      setBestScores(updatedScores)
      localStorage.setItem("sudoku-best-scores", JSON.stringify(updatedScores))
    }
  }

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (originalGrid[row][col] === 0) {
      setSelectedCell({ row, col })
    }
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedCell || isComplete) return

      const { row, col } = selectedCell
      if (e.key >= "1" && e.key <= "9") {
        handleCellInput(row, col, e.key)
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        handleCellInput(row, col, "0")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [selectedCell, isComplete, grid, errors])

  // Start new game
  const startNewGame = () => {
    setGrid(initialPuzzle.map((row) => [...row]))
    setSelectedCell(null)
    setErrors(new Set())
    setIsComplete(false)
    setTimer(0)
    setIsPlaying(true)
    setMistakes(0)
    setScore(0)
  }

  // Toggle pause
  const togglePause = () => {
    setIsPlaying(!isPlaying)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Get cell styling
  const getCellStyle = (row: number, col: number) => {
    const isPreFilled = originalGrid[row][col] !== 0
    const isSelected = selectedCell?.row === row && selectedCell?.col === col
    const hasError = errors.has(`${row}-${col}`)
    const isInSameRow = selectedCell?.row === row
    const isInSameCol = selectedCell?.col === col
    const isInSameBox =
      selectedCell &&
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(col / 3)

    let className =
      "w-12 h-12 border border-gray-300 flex items-center justify-center text-lg font-semibold cursor-pointer transition-colors "

    if (isPreFilled) {
      className += "bg-gray-100 text-gray-800 font-bold "
    } else {
      className += "bg-white hover:bg-blue-50 "
    }

    if (isSelected) {
      className += "bg-blue-200 ring-2 ring-blue-500 "
    } else if (isInSameRow || isInSameCol || isInSameBox) {
      className += "bg-blue-50 "
    }

    if (hasError) {
      className += "bg-red-100 text-red-600 "
    }

    // Thicker borders for 3x3 boxes
    if (row % 3 === 0) className += "border-t-2 border-t-gray-800 "
    if (col % 3 === 0) className += "border-l-2 border-l-gray-800 "
    if (row === 8) className += "border-b-2 border-b-gray-800 "
    if (col === 8) className += "border-r-2 border-r-gray-800 "

    return className
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sudoku Master</h1>
          <p className="text-gray-600">Fill the 9×9 grid so that each row, column, and 3×3 box contains digits 1-9</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-9 gap-0 w-fit mx-auto border-2 border-gray-800">
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={getCellStyle(rowIndex, colIndex)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell !== 0 ? cell : ""}
                      </div>
                    )),
                  )}
                </div>

                {/* Number Input Buttons */}
                <div className="flex justify-center mt-6 gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedCell) {
                          handleCellInput(selectedCell.row, selectedCell.col, num.toString())
                        }
                      }}
                      disabled={!selectedCell || isComplete}
                      className="w-10 h-10"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedCell) {
                        handleCellInput(selectedCell.row, selectedCell.col, "0")
                      }
                    }}
                    disabled={!selectedCell || isComplete}
                    className="w-16 h-10"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info & Controls */}
          <div className="space-y-6">
            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Game Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Time:</span>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {formatTime(timer)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mistakes:</span>
                  <Badge variant={mistakes > 0 ? "destructive" : "secondary"} className="text-lg px-3 py-1">
                    {mistakes}
                  </Badge>
                </div>
                {isComplete && (
                  <div className="flex justify-between items-center">
                    <span>Score:</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {score}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={startNewGame} className="w-full" variant="default">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Game
                </Button>
                <Button onClick={togglePause} className="w-full" variant="outline" disabled={isComplete}>
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Best Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Best Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bestScores.length > 0 ? (
                  <div className="space-y-2">
                    {bestScores.map((scoreEntry, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>#{index + 1}</span>
                        <span>{scoreEntry.score} pts</span>
                        <span>{formatTime(scoreEntry.time)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No scores yet. Complete a puzzle to see your best scores!</p>
                )}
              </CardContent>
            </Card>

            {/* Completion Message */}
            {isComplete && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
                  <p className="text-green-700 mb-2">You completed the puzzle!</p>
                  <p className="text-sm text-green-600">
                    Time: {formatTime(timer)} | Score: {score} points
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold mb-2">Rules:</h4>
                <ul className="space-y-1">
                  <li>• Fill each row with numbers 1-9</li>
                  <li>• Fill each column with numbers 1-9</li>
                  <li>• Fill each 3×3 box with numbers 1-9</li>
                  <li>• No number can repeat in any row, column, or box</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Controls:</h4>
                <ul className="space-y-1">
                  <li>• Click a cell to select it</li>
                  <li>• Use number buttons or keyboard (1-9)</li>
                  <li>• Press Backspace or 0 to clear a cell</li>
                  <li>• Red cells indicate rule violations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
