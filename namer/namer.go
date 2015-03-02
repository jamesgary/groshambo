package namer

import (
	"fmt"
	"github.com/Pallinder/go-randomdata"
	"unicode"
)

func NewName() string {
	return fmt.Sprintf("%s%s",
		capitalize(randomdata.Adjective()),
		capitalize(randomdata.Noun()),
	)
}

func capitalize(s string) string {
	runes := []rune(s)
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}
