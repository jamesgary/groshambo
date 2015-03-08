package naming

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"math/rand"
	"strconv"
	"strings"
	"unicode"
)

type Namer interface {
	// Generating a name will return a name and its internal ID
	Generate() (string, string)

	// Given an ID, get the corresponding name. Returns error if not found
	Get(string) (string, error)
}

type namer struct {
	adjectives []string
	nouns      []string
}

func NewNamer() (Namer, error) {
	var adjectives []string
	var nouns []string

	adjData, err := ioutil.ReadFile("./naming/data/adjectives.json")
	if err != nil {
		return nil, err
	}

	nounData, err := ioutil.ReadFile("./naming/data/nouns.json")
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(adjData, &adjectives)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(nounData, &nouns)
	if err != nil {
		return nil, err
	}

	return &namer{
		adjectives: adjectives,
		nouns:      nouns,
	}, nil
}

func (n *namer) Generate() (string, string) {
	adjIndex := rand.Intn(len(n.adjectives))
	nounIndex := rand.Intn(len(n.nouns))

	name, _ := n.create(adjIndex, nounIndex) // will never get error

	id := fmt.Sprintf("%d:%d", adjIndex, nounIndex)

	return name, id
}

func (n *namer) Get(id string) (string, error) {
	splitId := strings.Split(id, ":")
	if len(splitId) != 2 {
		return "", errors.New("Invalid id!")
	}
	adjIndexStr := splitId[0]
	nounIndexStr := splitId[1]

	adjIndex, err := strconv.ParseInt(adjIndexStr, 10, 0)
	if err != nil {
		return "", errors.New("Invalid id!")
	}

	nounIndex, err := strconv.ParseInt(nounIndexStr, 10, 0)
	if err != nil {
		return "", errors.New("Invalid id!")
	}

	name, err := n.create(int(adjIndex), int(nounIndex))
	return name, err
}

func (n *namer) create(adjIndex, nounIndex int) (string, error) {
	if 0 <= adjIndex && adjIndex < len(n.adjectives) && 0 <= nounIndex && nounIndex < len(n.nouns) {
		name := fmt.Sprintf("%s%s",
			capitalize(n.adjectives[adjIndex]),
			capitalize(n.nouns[nounIndex]),
		)
		return name, nil
	} else {
		return "", errors.New("Invalid id!")
	}
}

func capitalize(s string) string {
	runes := []rune(s)
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}
