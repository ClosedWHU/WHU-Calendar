//go:build ignore

package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

func main() {
	sourceDir := filepath.Join("..", "data")
	targetDir := filepath.Join(".", "data")

	entries, err := os.ReadDir(sourceDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "read source dir: %v\n", err)
		os.Exit(1)
	}

	if err := os.MkdirAll(targetDir, 0755); err != nil {
		fmt.Fprintf(os.Stderr, "create target dir: %v\n", err)
		os.Exit(1)
	}

	copied := 0
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}
		src := filepath.Join(sourceDir, entry.Name())
		dst := filepath.Join(targetDir, entry.Name())
		if err := copyFile(src, dst); err != nil {
			fmt.Fprintf(os.Stderr, "copy %s: %v\n", entry.Name(), err)
			os.Exit(1)
		}
		fmt.Printf("Copied %s\n", entry.Name())
		copied++
	}
	fmt.Printf("Done — %d file(s) synced.\n", copied)
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}
