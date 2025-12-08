package bot

import (
	"math/rand"
	"time"
)

const (
	codeLength = 6
)

func generateRandomCode(length int) string {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	charset := "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rng.Intn(len(charset))]
	}

	return string(result)
}

func generateCode() string {
	return generateRandomCode(codeLength)
}
