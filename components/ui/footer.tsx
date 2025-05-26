import { Github } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with ❤️ by{" "}
          <Link
            href="https://github.com/varun28sharma"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Varun Sharma
          </Link>
          . The source code is available on{" "}
          <Link
            href="https://github.com/varun28sharma/interactive-sudoku-game"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </Link>
          .
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/varun28sharma/interactive-sudoku-game"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            FOSS • MIT License
          </p>
        </div>
      </div>
    </footer>
  )
} 