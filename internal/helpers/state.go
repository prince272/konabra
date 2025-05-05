package helpers

import (
	"sync"
	"time"
)

type Item struct {
	value      any
	expiration int64
}

type State struct {
	items map[string]Item
	mu    sync.RWMutex
}

func NewState() *State {
	s := &State{
		items: make(map[string]Item),
	}
	go s.cleanupExpired()
	return s
}

func (s *State) SetItem(key string, value any, expiration time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var exp int64
	if expiration > 0 {
		exp = time.Now().Add(expiration).UnixNano()
	}

	s.items[key] = Item{
		value:      value,
		expiration: exp,
	}
}

func (s *State) PeekItem(key string) any {
	s.mu.RLock()
	defer s.mu.RUnlock()

	item, found := s.items[key]
	if !found || (item.expiration > 0 && time.Now().UnixNano() > item.expiration) {
		return nil
	}

	return item.value
}

func (s *State) PopItem(key string) any {
	s.mu.Lock()
	defer s.mu.Unlock()

	item, found := s.items[key]
	if !found || (item.expiration > 0 && time.Now().UnixNano() > item.expiration) {
		return nil
	}

	// Remove the item after fetching it
	delete(s.items, key)

	return item.value
}

func (s *State) HasKey(key string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()

	item, found := s.items[key]
	if !found {
		return false
	}

	if item.expiration > 0 && time.Now().UnixNano() > item.expiration {
		return false
	}

	return true
}

func (s *State) RemoveItem(key string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.items, key)
}

func (s *State) Clear() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.items = make(map[string]Item)
}

func (s *State) cleanupExpired() {
	for {
		time.Sleep(1 * time.Minute)

		s.mu.Lock()
		now := time.Now().UnixNano()
		for key, item := range s.items {
			if item.expiration > 0 && now > item.expiration {
				delete(s.items, key)
			}
		}
		s.mu.Unlock()
	}
}
