package users

import (
	"errors"
	"slices"
)

var ErrLastAdmin = errors.New("at least one admin must remain")

type Role string

const (
	Admin     Role = "admin"
	Publisher Role = "publisher"
)

func (r Role) Valid() bool {
	return slices.Contains([]Role{Admin, Publisher}, r)
}

// RosterEvent records a change to the roster that RosterRepository.Save must
// persist.
type RosterEvent interface{ isRosterEvent() }

type RoleAssigned struct {
	UserID int64
	Role   Role
}

type UserRemoved struct {
	UserID int64
}

func (RoleAssigned) isRosterEvent() {}
func (UserRemoved) isRosterEvent()  {}

// Roster is the set of administrators. RosterRepository.Load serialises its
// callers, so concurrent changes cannot each observe another administrator and
// together remove them all. At least one administrator must always remain.
type Roster struct {
	admins map[int64]struct{}
	events []RosterEvent
}

func NewRoster(adminIDs ...int64) *Roster {
	admins := make(map[int64]struct{}, len(adminIDs))
	for _, id := range adminIDs {
		admins[id] = struct{}{}
	}
	return &Roster{admins: admins}
}

// Assign gives the user a single role, replacing any role they had.
func (r *Roster) Assign(userID int64, role Role) error {
	if role == Admin {
		r.admins[userID] = struct{}{}
	} else if err := r.release(userID); err != nil {
		return err
	}
	r.events = append(r.events, RoleAssigned{UserID: userID, Role: role})
	return nil
}

// Remove drops the user from the roster before the user is deleted.
func (r *Roster) Remove(userID int64) error {
	if err := r.release(userID); err != nil {
		return err
	}
	r.events = append(r.events, UserRemoved{UserID: userID})
	return nil
}

func (r *Roster) IsAdmin(userID int64) bool {
	_, ok := r.admins[userID]
	return ok
}

func (r *Roster) Admins() []int64 {
	ids := make([]int64, 0, len(r.admins))
	for id := range r.admins {
		ids = append(ids, id)
	}
	slices.Sort(ids)
	return ids
}

// PullEvents returns the changes recorded since the last call and clears them.
func (r *Roster) PullEvents() []RosterEvent {
	events := r.events
	r.events = nil
	return events
}

func (r *Roster) release(userID int64) error {
	if !r.IsAdmin(userID) {
		return nil
	}
	if len(r.admins) == 1 {
		return ErrLastAdmin
	}
	delete(r.admins, userID)
	return nil
}
