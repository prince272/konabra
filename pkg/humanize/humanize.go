package humanize

import (
	"fmt"
	"math"
	"reflect"
	"regexp"
	"strings"
	"time"
	"unicode"
)

// LetterCasing represents different casing styles (legacy)
type LetterCasing int

const (
	NoChange LetterCasing = iota
	LowerCase
	SentenceCase
	TitleCase
	AllCaps
)

// Humanize converts a computer-friendly string into a human-friendly one
func Humanize(input string, casing ...LetterCasing) string {
	var result string

	// Check if entire string is uppercase (acronym)
	if isAllUpper(input) {
		return input
	}

	// Handle PascalCase
	if strings.Contains(input, "_") {
		// Handle snake_case
		parts := strings.Split(input, "_")
		for i, part := range parts {
			if isAllUpper(part) {
				parts[i] = part
			} else {
				parts[i] = strings.ToLower(part)
			}
		}
		result = strings.Join(parts, " ")
	} else {
		// Handle PascalCase
		var words []string
		wordStart := 0

		for i, r := range input {
			if i > 0 && unicode.IsUpper(r) {
				word := input[wordStart:i]
				if isAllUpper(word) {
					words = append(words, word)
				} else {
					words = append(words, strings.ToLower(word))
				}
				wordStart = i
			}
		}
		if wordStart < len(input) {
			word := input[wordStart:]
			if isAllUpper(word) {
				words = append(words, word)
			} else {
				words = append(words, strings.ToLower(word))
			}
		}

		result = strings.Join(words, " ")
	}

	// Apply casing if specified
	if len(casing) > 0 {
		switch casing[0] {
		case LowerCase:
			result = strings.ToLower(result)
		case SentenceCase:
			if len(result) > 0 {
				result = strings.ToUpper(result[:1]) + strings.ToLower(result[1:])
			}
		case TitleCase:
			result = strings.Title(strings.ToLower(result))
		case AllCaps:
			result = strings.ToUpper(result)
		}
	}

	return result
}

// Dehumanize converts a human-friendly string into a computer-friendly PascalCase one
func Dehumanize(input string) string {
	words := strings.Fields(input)
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + strings.ToLower(word[1:])
		}
	}
	return strings.Join(words, "")
}

// Transform applies transformations to a string
func Transform(input string, transformers ...func(string) string) string {
	result := input
	for _, transform := range transformers {
		result = transform(result)
	}
	return result
}

// ToLowerCase transformer
func ToLowerCase(input string) string {
	return strings.ToLower(input)
}

// ToSentenceCase transformer
func ToSentenceCase(input string) string {
	if len(input) == 0 {
		return input
	}
	return strings.ToUpper(input[:1]) + strings.ToLower(input[1:])
}

// ToTitleCase transformer
func ToTitleCase(input string) string {
	return strings.Title(strings.ToLower(input))
}

// ToUpperCase transformer
func ToUpperCase(input string) string {
	return strings.ToUpper(input)
}

// Truncate shortens a string with options
type Truncator int

const (
	FixedLength Truncator = iota
	FixedNumberOfCharacters
	FixedNumberOfWords
	DynamicLengthAndPreserveWords
	DynamicNumberOfCharactersAndPreserveWords
)

type TruncateFrom int

const (
	Right TruncateFrom = iota
	Left
)

func Truncate(input string, length int, options ...interface{}) string {
	// Default options
	truncationString := "…"
	truncator := FixedLength
	from := Right

	// Parse options
	for _, opt := range options {
		switch v := opt.(type) {
		case string:
			truncationString = v
		case Truncator:
			truncator = v
		case TruncateFrom:
			from = v
		}
	}

	if len(input) <= length {
		return input
	}

	if len(truncationString) > length {
		return truncationString[:length]
	}

	switch truncator {
	case FixedLength:
		if from == Right {
			if length-len(truncationString) >= 0 {
				return input[:length-len(truncationString)] + truncationString
			}
		} else {
			start := len(input) - (length - len(truncationString))
			if start >= 0 {
				return truncationString + input[start:]
			}
		}

	case FixedNumberOfCharacters:
		chars := 0
		result := []rune{}
		truncRunes := []rune(truncationString)

		if from == Right {
			for _, r := range input {
				if chars >= length-len(truncRunes) {
					break
				}
				result = append(result, r)
				chars++
			}
			return string(result) + truncationString
		} else {
			runes := []rune(input)
			charsNeeded := length - len(truncRunes)
			start := len(runes) - charsNeeded
			if start < 0 {
				start = 0
			}
			return truncationString + string(runes[start:])
		}

	case FixedNumberOfWords:
		words := strings.Fields(input)
		if from == Right {
			if len(words) <= length {
				return input
			}
			return strings.Join(words[:length], " ") + truncationString
		} else {
			if len(words) <= length {
				return input
			}
			return truncationString + strings.Join(words[len(words)-length:], " ")
		}

	case DynamicLengthAndPreserveWords:
		if from == Right {
			if len(input) <= length {
				return input
			}

			// Try to find the last space before the truncation point
			truncPoint := length - len(truncationString)
			if truncPoint <= 0 {
				return truncationString
			}

			lastSpace := strings.LastIndex(input[:truncPoint], " ")
			if lastSpace > 0 {
				return input[:lastSpace] + truncationString
			}
			return input[:truncPoint] + truncationString
		} else {
			if len(input) <= length {
				return input
			}

			// Try to find the first space after the truncation point
			truncPoint := len(input) - (length - len(truncationString))
			if truncPoint >= len(input) {
				return truncationString
			}

			firstSpace := strings.Index(input[truncPoint:], " ")
			if firstSpace > 0 {
				return truncationString + input[truncPoint+firstSpace+1:]
			}
			return truncationString + input[truncPoint:]
		}

	case DynamicNumberOfCharactersAndPreserveWords:
		if from == Right {
			runes := []rune(input)
			if len(runes) <= length {
				return input
			}

			truncPoint := length - len([]rune(truncationString))
			if truncPoint <= 0 {
				return truncationString
			}

			// Find last word boundary
			for i := truncPoint; i >= 0; i-- {
				if i == 0 || unicode.IsSpace(runes[i-1]) {
					return string(runes[:i]) + truncationString
				}
			}
			return truncationString
		} else {
			runes := []rune(input)
			if len(runes) <= length {
				return input
			}

			truncPoint := len(runes) - (length - len([]rune(truncationString)))
			if truncPoint >= len(runes) {
				return truncationString
			}

			// Find next word boundary
			for i := truncPoint; i < len(runes); i++ {
				if i == len(runes)-1 || unicode.IsSpace(runes[i+1]) {
					return truncationString + string(runes[i+1:])
				}
			}
			return truncationString
		}
	}

	return input
}

// Helper function to check if a string is all uppercase
func isAllUpper(s string) bool {
	for _, r := range s {
		if !unicode.IsUpper(r) && unicode.IsLetter(r) {
			return false
		}
	}
	return len(s) > 0
}

// Helper function to check if a string is all lowercase
func isAllLower(s string) bool {
	for _, r := range s {
		if !unicode.IsLower(r) && unicode.IsLetter(r) {
			return false
		}
	}
	return len(s) > 0
}

// DateTimeHumanizer provides human-friendly representations of dates
type DateTimeHumanizer struct {
	NowFunc func() time.Time // Allows mocking time in tests
}

// NewDateTimeHumanizer creates a new DateTimeHumanizer
func NewDateTimeHumanizer() *DateTimeHumanizer {
	return &DateTimeHumanizer{
		NowFunc: time.Now,
	}
}

// Humanize returns a human-friendly representation of the time difference
func (h *DateTimeHumanizer) Humanize(t time.Time, compareTo ...time.Time) string {
	var compareTime time.Time
	if len(compareTo) > 0 {
		compareTime = compareTo[0]
	} else {
		compareTime = h.NowFunc()
	}

	// Handle UTC times correctly
	if t.Location() == time.UTC {
		compareTime = compareTime.UTC()
	}

	diff := compareTime.Sub(t)
	return h.humanizeDuration(diff, t.Before(compareTime))
}

// HumanizeDuration returns a human-friendly representation of a duration
func (h *DateTimeHumanizer) humanizeDuration(d time.Duration, past bool) string {
	seconds := int(math.Abs(d.Seconds()))

	switch {
	case seconds < 5:
		return "just now"
	case seconds < 60:
		return h.formatTimeUnit(seconds, "second", past)
	case seconds < 3600:
		minutes := seconds / 60
		return h.formatTimeUnit(minutes, "minute", past)
	case seconds < 86400:
		hours := seconds / 3600
		return h.formatTimeUnit(hours, "hour", past)
	case seconds < 172800: // 48 hours
		if past {
			return "yesterday"
		}
		return "tomorrow"
	case seconds < 2592000: // ~30 days
		days := seconds / 86400
		return h.formatTimeUnit(days, "day", past)
	case seconds < 31536000: // ~1 year
		months := seconds / 2592000
		return h.formatTimeUnit(months, "month", past)
	default:
		years := seconds / 31536000
		return h.formatTimeUnit(years, "year", past)
	}
}

func (h *DateTimeHumanizer) formatTimeUnit(value int, unit string, past bool) string {
	if value == 1 {
		if past {
			return fmt.Sprintf("an %s ago", unit)
		}
		return fmt.Sprintf("an %s from now", unit)
	}

	if past {
		return fmt.Sprintf("%d %ss ago", value, unit)
	}
	return fmt.Sprintf("%d %ss from now", value, unit)
}

// TimeUnit represents units of time for TimeSpan humanization
type TimeUnit int

const (
	Millisecond TimeUnit = iota
	Second
	Minute
	Hour
	Day
	Week
	Month
	Year
)

// TimeSpanHumanizer provides human-friendly representations of time spans
type TimeSpanHumanizer struct{}

// NewTimeSpanHumanizer creates a new TimeSpanHumanizer
func NewTimeSpanHumanizer() *TimeSpanHumanizer {
	return &TimeSpanHumanizer{}
}

// Humanize returns a human-friendly representation of the time span
func (h *TimeSpanHumanizer) Humanize(d time.Duration, options ...HumanizeOption) string {
	config := &humanizeConfig{
		precision:           1,
		countEmptyUnits:     false,
		minUnit:             Millisecond,
		maxUnit:             Week,
		collectionSeparator: ", ",
		toWords:             false,
	}

	for _, option := range options {
		option(config)
	}

	// Convert duration to milliseconds for easier calculations
	totalMs := int64(d / time.Millisecond)
	if totalMs == 0 {
		if config.toWords {
			return "no time"
		}
		return h.formatUnit(0, config.minUnit, config.toWords)
	}

	var parts []string
	remaining := totalMs

	// Define units in descending order
	units := []struct {
		unit       TimeUnit
		ms         int64
		threshold  float64
		nextUnitMs int64
	}{
		{Year, 365 * 24 * 60 * 60 * 1000, 0.75, 30 * 24 * 60 * 60 * 1000},
		{Month, 30 * 24 * 60 * 60 * 1000, 0.75, 7 * 24 * 60 * 60 * 1000},
		{Week, 7 * 24 * 60 * 60 * 1000, 0.75, 24 * 60 * 60 * 1000},
		{Day, 24 * 60 * 60 * 1000, 0.75, 60 * 60 * 1000},
		{Hour, 60 * 60 * 1000, 0.75, 60 * 1000},
		{Minute, 60 * 1000, 0.75, 1000},
		{Second, 1000, 0.75, 1},
		{Millisecond, 1, 0, 0},
	}

	// Find the starting unit based on maxUnit
	startUnit := 0
	for i, u := range units {
		if u.unit == config.maxUnit {
			startUnit = i
			break
		}
	}

	// Process each unit
	for i := startUnit; i < len(units); i++ {
		u := units[i]
		if u.unit < config.minUnit {
			continue
		}

		if remaining < u.ms {
			continue
		}

		value := remaining / u.ms
		remaining = remaining % u.ms

		// Check if we should include this unit based on precision
		if len(parts) < config.precision || (config.countEmptyUnits && value > 0) {
			parts = append(parts, h.formatUnit(value, u.unit, config.toWords))
		}

		// Stop if we've reached the desired precision
		if len(parts) >= config.precision && !config.countEmptyUnits {
			break
		}
	}

	if len(parts) == 0 {
		return h.formatUnit(0, config.minUnit, config.toWords)
	}

	return strings.Join(parts, config.collectionSeparator)
}

func (h *TimeSpanHumanizer) formatUnit(value int64, unit TimeUnit, toWords bool) string {
	if toWords {
		// In a real implementation, you'd use a number-to-words converter here
		// This is a simplified version
		if value == 1 {
			return fmt.Sprintf("one %s", h.unitName(value, unit))
		}
		return fmt.Sprintf("%d %s", value, h.unitName(value, unit))
	}
	return fmt.Sprintf("%d %s", value, h.unitName(value, unit))
}

func (h *TimeSpanHumanizer) unitName(value int64, unit TimeUnit) string {
	switch unit {
	case Millisecond:
		if value == 1 {
			return "millisecond"
		}
		return "milliseconds"
	case Second:
		if value == 1 {
			return "second"
		}
		return "seconds"
	case Minute:
		if value == 1 {
			return "minute"
		}
		return "minutes"
	case Hour:
		if value == 1 {
			return "hour"
		}
		return "hours"
	case Day:
		if value == 1 {
			return "day"
		}
		return "days"
	case Week:
		if value == 1 {
			return "week"
		}
		return "weeks"
	case Month:
		if value == 1 {
			return "month"
		}
		return "months"
	case Year:
		if value == 1 {
			return "year"
		}
		return "years"
	default:
		return ""
	}
}

// ToAge returns an age representation of the time span
func (h *TimeSpanHumanizer) ToAge(d time.Duration, options ...HumanizeOption) string {
	// Default options for age
	config := &humanizeConfig{
		precision: 1,
		maxUnit:   Year,
	}

	for _, option := range options {
		option(config)
	}

	// Create new options for Humanize with age defaults
	ageOptions := []HumanizeOption{
		WithPrecision(config.precision),
		WithMaxUnit(config.maxUnit),
		WithToWords(config.toWords),
	}

	return h.Humanize(d, ageOptions...) + " old"
}

// humanizeConfig holds configuration for TimeSpan humanization
type humanizeConfig struct {
	precision           int
	countEmptyUnits     bool
	minUnit             TimeUnit
	maxUnit             TimeUnit
	collectionSeparator string
	toWords             bool
}

// HumanizeOption configures TimeSpan humanization
type HumanizeOption func(*humanizeConfig)

// WithPrecision sets the precision for humanization
func WithPrecision(p int) HumanizeOption {
	return func(c *humanizeConfig) {
		c.precision = p
	}
}

// WithCountEmptyUnits sets whether to count empty units towards precision
func WithCountEmptyUnits(b bool) HumanizeOption {
	return func(c *humanizeConfig) {
		c.countEmptyUnits = b
	}
}

// WithMinUnit sets the minimum time unit to display
func WithMinUnit(u TimeUnit) HumanizeOption {
	return func(c *humanizeConfig) {
		c.minUnit = u
	}
}

// WithMaxUnit sets the maximum time unit to display
func WithMaxUnit(u TimeUnit) HumanizeOption {
	return func(c *humanizeConfig) {
		c.maxUnit = u
	}
}

// WithCollectionSeparator sets the separator between time units
func WithCollectionSeparator(s string) HumanizeOption {
	return func(c *humanizeConfig) {
		c.collectionSeparator = s
	}
}

// WithToWords sets whether to convert numbers to words
func WithToWords(b bool) HumanizeOption {
	return func(c *humanizeConfig) {
		c.toWords = b
	}
}

// CollectionFormatter defines the interface for custom collection formatters
type CollectionFormatter interface {
	Format(items []string, separator string) string
}

// DefaultCollectionFormatter is the default implementation of CollectionFormatter
type DefaultCollectionFormatter struct{}

// Format formats a collection with the given separator
func (f *DefaultCollectionFormatter) Format(items []string, separator string) string {
	switch len(items) {
	case 0:
		return ""
	case 1:
		return items[0]
	case 2:
		return items[0] + " " + separator + " " + items[1]
	default:
		allButLast := strings.Join(items[:len(items)-1], ", ")
		return allButLast + ", " + separator + " " + items[len(items)-1]
	}
}

var defaultCollectionFormatter CollectionFormatter = &DefaultCollectionFormatter{}

// Configurator manages package configuration
type Configurator struct {
	CollectionFormatters map[string]CollectionFormatter
}

var configurator = &Configurator{
	CollectionFormatters: make(map[string]CollectionFormatter),
}

// HumanizeCollection formats any enumerable collection into a human-readable string
func HumanizeCollection(collection interface{}, options ...func(*HumanizeOptions)) string {
	opts := &HumanizeOptions{
		Formatter:  "",
		Separator:  "and",
		SkipEmpty:  true,
		TrimItems:  true,
		FormatFunc: nil,
	}

	for _, option := range options {
		option(opts)
	}

	// Get the items as strings
	items := collectionToStrings(collection, opts)

	// Use the configured formatter or the default
	formatter := defaultCollectionFormatter
	if opts.Formatter != "" {
		if f, ok := configurator.CollectionFormatters[opts.Formatter]; ok {
			formatter = f
		}
	}

	return formatter.Format(items, opts.Separator)
}

func collectionToStrings(collection interface{}, opts *HumanizeOptions) []string {
	val := reflect.ValueOf(collection)
	if val.Kind() != reflect.Slice && val.Kind() != reflect.Array {
		return []string{fmt.Sprintf("%v", collection)}
	}

	var items []string
	for i := 0; i < val.Len(); i++ {
		item := val.Index(i).Interface()
		var str string

		if opts.FormatFunc != nil {
			// Call the format function
			results := reflect.ValueOf(opts.FormatFunc).Call([]reflect.Value{reflect.ValueOf(item)})
			if len(results) > 0 {
				str = results[0].String()
			}
		} else {
			// Use ToString() if available
			if stringer, ok := item.(fmt.Stringer); ok {
				str = stringer.String()
			} else {
				str = fmt.Sprintf("%v", item)
			}
		}

		if opts.TrimItems {
			str = strings.TrimSpace(str)
		}

		if !opts.SkipEmpty || str != "" {
			items = append(items, str)
		}
	}

	return items
}

// HumanizeOptions configures how collections are humanized
type HumanizeOptions struct {
	Formatter  string      // Name of a registered formatter
	Separator  string      // Separator word ("and", "or", etc.)
	SkipEmpty  bool        // Skip empty items
	TrimItems  bool        // Trim whitespace from items
	FormatFunc interface{} // Custom format function
}

// WithFormatter sets the formatter to use
func WithFormatter(name string) func(*HumanizeOptions) {
	return func(o *HumanizeOptions) {
		o.Formatter = name
	}
}

// WithSeparator sets the separator word
func WithSeparator(sep string) func(*HumanizeOptions) {
	return func(o *HumanizeOptions) {
		o.Separator = sep
	}
}

// WithSkipEmpty sets whether to skip empty items
func WithSkipEmpty(skip bool) func(*HumanizeOptions) {
	return func(o *HumanizeOptions) {
		o.SkipEmpty = skip
	}
}

// WithTrimItems sets whether to trim items
func WithTrimItems(trim bool) func(*HumanizeOptions) {
	return func(o *HumanizeOptions) {
		o.TrimItems = trim
	}
}

// WithFormatFunc sets a custom format function
func WithFormatFunc(fn interface{}) func(*HumanizeOptions) {
	return func(o *HumanizeOptions) {
		o.FormatFunc = fn
	}
}

// Inflector manages word inflection rules
type Inflector struct {
	plurals      []inflectionRule
	singulars    []inflectionRule
	irregulars   []irregularRule
	uncountables map[string]bool
}

type inflectionRule struct {
	pattern *regexp.Regexp
	replace string
}

type irregularRule struct {
	singular string
	plural   string
	matchEnd bool
}

var defaultInflector = NewInflector()

// NewInflector creates a new Inflector with default rules
func NewInflector() *Inflector {
	i := &Inflector{
		uncountables: make(map[string]bool),
	}

	// Add default rules
	i.AddPlural("$", "s")
	i.AddPlural("s$", "s")
	i.AddPlural("(ax|test)is$", "${1}es")
	i.AddPlural("(octop|vir)us$", "${1}i")
	i.AddPlural("(alias|status)$", "${1}es")
	i.AddPlural("(bu)s$", "${1}ses")
	i.AddPlural("(buffal|tomat)o$", "${1}oes")
	i.AddPlural("([ti])um$", "${1}a")
	i.AddPlural("sis$", "ses")
	i.AddPlural("(?:([^f])fe|([lr])f)$", "${1}${2}ves")
	i.AddPlural("(hive)$", "${1}s")
	i.AddPlural("([^aeiouy]|qu)y$", "${1}ies")
	i.AddPlural("(x|ch|ss|sh)$", "${1}es")
	i.AddPlural("(matr|vert|ind)ix|ex$", "${1}ices")
	i.AddPlural("([m|l])ouse$", "${1}ice")

	i.AddSingular("s$", "")
	i.AddSingular("(n)ews$", "${1}ews")
	i.AddSingular("([ti])a$", "${1}um")
	i.AddSingular("((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$", "${1}${2}sis")
	i.AddSingular("(^analy)ses$", "${1}sis")
	i.AddSingular("([^f])ves$", "${1}fe")
	i.AddSingular("(hive)s$", "${1}")
	i.AddSingular("(tive)s$", "${1}")
	i.AddSingular("([lr])ves$", "${1}f")
	i.AddSingular("([^aeiouy]|qu)ies$", "${1}y")
	i.AddSingular("(s)eries$", "${1}eries")
	i.AddSingular("(m)ovies$", "${1}ovie")
	i.AddSingular("(x|ch|ss|sh)es$", "${1}")
	i.AddSingular("([m|l])ice$", "${1}ouse")
	i.AddSingular("(bus)es$", "${1}")
	i.AddSingular("(o)es$", "${1}")
	i.AddSingular("(shoe)s$", "${1}")
	i.AddSingular("(cris|ax|test)es$", "${1}is")
	i.AddSingular("(octop|vir)i$", "${1}us")
	i.AddSingular("(alias|status)es$", "${1}")
	i.AddSingular("^(ox)en$", "${1}")
	i.AddSingular("(vert|ind)ices$", "${1}ex")
	i.AddSingular("(matr)ices$", "${1}ix")
	i.AddSingular("(quiz)zes$", "${1}")

	i.AddIrregular("person", "people", true)
	i.AddIrregular("man", "men", true)
	i.AddIrregular("child", "children", true)
	i.AddIrregular("sex", "sexes", true)
	i.AddIrregular("move", "moves", true)
	i.AddIrregular("goose", "geese", true)
	i.AddIrregular("alumna", "alumnae", true)
	i.AddIrregular("datum", "data", true)

	i.AddUncountable("equipment")
	i.AddUncountable("information")
	i.AddUncountable("rice")
	i.AddUncountable("money")
	i.AddUncountable("species")
	i.AddUncountable("series")
	i.AddUncountable("fish")
	i.AddUncountable("sheep")
	i.AddUncountable("deer")
	i.AddUncountable("aircraft")

	return i
}

// AddPlural adds a pluralization rule
func (i *Inflector) AddPlural(pattern, replace string) {
	i.plurals = append(i.plurals, inflectionRule{
		pattern: regexp.MustCompile(pattern),
		replace: replace,
	})
}

// AddSingular adds a singularization rule
func (i *Inflector) AddSingular(pattern, replace string) {
	i.singulars = append(i.singulars, inflectionRule{
		pattern: regexp.MustCompile(pattern),
		replace: replace,
	})
}

// AddIrregular adds an irregular word
func (i *Inflector) AddIrregular(singular, plural string, matchEnd bool) {
	i.irregulars = append(i.irregulars, irregularRule{
		singular: singular,
		plural:   plural,
		matchEnd: matchEnd,
	})
}

// AddUncountable adds an uncountable word
func (i *Inflector) AddUncountable(word string) {
	i.uncountables[strings.ToLower(word)] = true
}

// Pluralize pluralizes a word
func (i *Inflector) Pluralize(word string, inputIsKnownToBeSingular ...bool) string {
	knownSingular := true
	if len(inputIsKnownToBeSingular) > 0 {
		knownSingular = inputIsKnownToBeSingular[0]
	}

	lower := strings.ToLower(word)

	// Check uncountables first
	if i.uncountables[lower] {
		return word
	}

	// Check irregulars
	for _, irreg := range i.irregulars {
		if irreg.matchEnd {
			if strings.HasSuffix(lower, strings.ToLower(irreg.singular)) {
				return word[:len(word)-len(irreg.singular)] + irreg.plural
			}
			if strings.HasSuffix(lower, strings.ToLower(irreg.plural)) {
				return word // already plural
			}
		} else {
			if lower == strings.ToLower(irreg.singular) {
				return irreg.plural
			}
			if lower == strings.ToLower(irreg.plural) {
				return word // already plural
			}
		}
	}

	// If we know it's singular, just apply plural rules
	if knownSingular {
		for _, rule := range i.plurals {
			if rule.pattern.MatchString(word) {
				return rule.pattern.ReplaceAllString(word, rule.replace)
			}
		}
		return word + "s" // default
	}

	// If we're not sure, check if it's already plural
	for _, rule := range i.singulars {
		if rule.pattern.MatchString(word) {
			// It's plural, return as-is
			return word
		}
	}

	// Otherwise apply plural rules
	for _, rule := range i.plurals {
		if rule.pattern.MatchString(word) {
			return rule.pattern.ReplaceAllString(word, rule.replace)
		}
	}

	return word + "s" // default
}

// Singularize singularizes a word
func (i *Inflector) Singularize(word string, inputIsKnownToBePlural ...bool) string {
	knownPlural := true
	if len(inputIsKnownToBePlural) > 0 {
		knownPlural = inputIsKnownToBePlural[0]
	}

	lower := strings.ToLower(word)

	// Check uncountables first
	if i.uncountables[lower] {
		return word
	}

	// Check irregulars
	for _, irreg := range i.irregulars {
		if irreg.matchEnd {
			if strings.HasSuffix(lower, strings.ToLower(irreg.plural)) {
				return word[:len(word)-len(irreg.plural)] + irreg.singular
			}
			if strings.HasSuffix(lower, strings.ToLower(irreg.singular)) {
				return word // already singular
			}
		} else {
			if lower == strings.ToLower(irreg.plural) {
				return irreg.singular
			}
			if lower == strings.ToLower(irreg.singular) {
				return word // already singular
			}
		}
	}

	// If we know it's plural, just apply singular rules
	if knownPlural {
		for _, rule := range i.singulars {
			if rule.pattern.MatchString(word) {
				return rule.pattern.ReplaceAllString(word, rule.replace)
			}
		}
		return word // default (could be wrong)
	}

	// If we're not sure, check if it's already singular
	for _, rule := range i.plurals {
		if rule.pattern.MatchString(word) {
			// It's plural, return as-is
			return word
		}
	}

	// Otherwise apply singular rules
	for _, rule := range i.singulars {
		if rule.pattern.MatchString(word) {
			return rule.pattern.ReplaceAllString(word, rule.replace)
		}
	}

	return word // default (could be wrong)
}

// Pluralize is the package-level function for pluralizing words
func Pluralize(word string, inputIsKnownToBeSingular ...bool) string {
	return defaultInflector.Pluralize(word, inputIsKnownToBeSingular...)
}

// Singularize is the package-level function for singularizing words
func Singularize(word string, inputIsKnownToBePlural ...bool) string {
	return defaultInflector.Singularize(word, inputIsKnownToBePlural...)
}

// ToQuantity formats a word with a quantity
func ToQuantity(word string, quantity int, options ...ToQuantityOption) string {
	opts := &toQuantityOptions{
		showQuantityAs: ShowQuantityAsNumeric,
		format:         "",
		culture:        nil,
	}

	for _, option := range options {
		option(opts)
	}

	var quantityStr string
	switch opts.showQuantityAs {
	case ShowQuantityAsWords:
		quantityStr = numberToWords(quantity)
	case ShowQuantityAsNone:
		quantityStr = ""
	default:
		if opts.format != "" {
			if opts.culture != nil {
				// In a real implementation, you'd use the culture to format
				quantityStr = fmt.Sprintf(opts.format, quantity)
			} else {
				quantityStr = fmt.Sprintf(opts.format, quantity)
			}
		} else {
			quantityStr = fmt.Sprintf("%d", quantity)
		}
	}

	// Determine if we should pluralize or singularize
	var resultWord string
	if quantity == 1 {
		resultWord = Singularize(word, false)
	} else {
		resultWord = Pluralize(word, false)
	}

	if quantityStr == "" {
		return resultWord
	}
	return quantityStr + " " + resultWord
}

// ShowQuantityAs defines how quantities should be displayed
type ShowQuantityAs int

const (
	ShowQuantityAsNumeric ShowQuantityAs = iota
	ShowQuantityAsWords
	ShowQuantityAsNone
)

type toQuantityOptions struct {
	showQuantityAs ShowQuantityAs
	format         string
	culture        interface{} // Would be *culture.Culture in a real implementation
}

type ToQuantityOption func(*toQuantityOptions)

// WithShowQuantityAs sets how the quantity should be displayed
func WithShowQuantityAs(showAs ShowQuantityAs) ToQuantityOption {
	return func(o *toQuantityOptions) {
		o.showQuantityAs = showAs
	}
}

// WithFormat sets a format string for the quantity
func WithFormat(format string) ToQuantityOption {
	return func(o *toQuantityOptions) {
		o.format = format
	}
}

// WithCulture sets the culture for formatting
func WithCulture(culture interface{}) ToQuantityOption {
	return func(o *toQuantityOptions) {
		o.culture = culture
	}
}

// Ordinalize converts a number to an ordinal string
func Ordinalize(number interface{}, options ...OrdinalizeOption) string {
	opts := &ordinalizeOptions{
		gender:   GrammaticalGenderNeuter,
		wordForm: WordFormNormal,
	}

	for _, option := range options {
		option(opts)
	}

	var num int
	switch n := number.(type) {
	case int:
		num = n
	case string:
		// Try to parse the string as a number
		// In a real implementation, you'd properly handle this
		fmt.Sscanf(n, "%d", &num)
	default:
		return fmt.Sprintf("%v", number)
	}

	// English ordinal rules
	if num%100 >= 11 && num%100 <= 13 {
		return fmt.Sprintf("%dth", num)
	}

	switch num % 10 {
	case 1:
		return fmt.Sprintf("%dst", num)
	case 2:
		return fmt.Sprintf("%dnd", num)
	case 3:
		return fmt.Sprintf("%drd", num)
	default:
		return fmt.Sprintf("%dth", num)
	}
}

// GrammaticalGender represents grammatical gender for ordinalization
type GrammaticalGender int

const (
	GrammaticalGenderMasculine GrammaticalGender = iota
	GrammaticalGenderFeminine
	GrammaticalGenderNeuter
)

// WordForm represents different forms of ordinal words
type WordForm int

const (
	WordFormNormal WordForm = iota
	WordFormAbbreviation
)

type ordinalizeOptions struct {
	gender   GrammaticalGender
	wordForm WordForm
}

type OrdinalizeOption func(*ordinalizeOptions)

// WithGrammaticalGender sets the grammatical gender for ordinalization
func WithGrammaticalGender(gender GrammaticalGender) OrdinalizeOption {
	return func(o *ordinalizeOptions) {
		o.gender = gender
	}
}

// WithWordForm sets the word form for ordinalization
func WithWordForm(form WordForm) OrdinalizeOption {
	return func(o *ordinalizeOptions) {
		o.wordForm = form
	}
}

// Titleize converts words to title case
func Titleize(input string) string {
	return Transform(input, ToTitleCase)
}

// Pascalize converts a string to PascalCase
func Pascalize(input string) string {
	return Transform(input, ToPascalCase)
}

// ToPascalCase converts a string to PascalCase
func ToPascalCase(input string) string {
	words := strings.Fields(Humanize(input))
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + strings.ToLower(word[1:])
		}
	}
	return strings.Join(words, "")
}

// Camelize converts a string to camelCase
func Camelize(input string) string {
	return Transform(input, ToCamelCase)
}

// ToCamelCase converts a string to camelCase
func ToCamelCase(input string) string {
	pascal := Pascalize(input)
	if len(pascal) == 0 {
		return pascal
	}
	return strings.ToLower(pascal[:1]) + pascal[1:]
}

// Underscore converts a string to snake_case
func Underscore(input string) string {
	return Transform(input, ToSnakeCase)
}

// ToSnakeCase converts a string to snake_case
func ToSnakeCase(input string) string {
	var result []rune
	for i, r := range input {
		if unicode.IsUpper(r) {
			if i > 0 {
				result = append(result, '_')
			}
			result = append(result, unicode.ToLower(r))
		} else {
			result = append(result, r)
		}
	}
	return string(result)
}

// Dasherize converts underscores to dashes
func Dasherize(input string) string {
	return strings.ReplaceAll(input, "_", "-")
}

// Hyphenate converts underscores to hyphens (alias for Dasherize)
func Hyphenate(input string) string {
	return Dasherize(input)
}

// Kebaberize converts a string to kebab-case
func Kebaberize(input string) string {
	return strings.ToLower(Dasherize(Underscore(input)))
}

// Helper function to convert numbers to words (simplified)
func numberToWords(num int) string {
	if num < 20 {
		words := []string{
			"zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
			"eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
		}
		return words[num]
	}

	if num < 100 {
		tens := []string{
			"twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
		}
		if num%10 == 0 {
			return tens[num/10-2]
		}
		return tens[num/10-2] + "-" + numberToWords(num%10)
	}

	if num < 1000 {
		if num%100 == 0 {
			return numberToWords(num/100) + " hundred"
		}
		return numberToWords(num/100) + " hundred and " + numberToWords(num%100)
	}

	// Simplified for this implementation
	return fmt.Sprintf("%d", num)
}
