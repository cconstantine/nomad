package state

import (
	"fmt"
	"sync"

	"github.com/boltdb/bolt"
	trstate "github.com/hashicorp/nomad/client/allocrunnerv2/taskrunner/state"
	oldstate "github.com/hashicorp/nomad/client/state"
	"github.com/hashicorp/nomad/nomad/structs"
)

var (
	// The following are the key paths written to the state database
	allocRunnerStateAllocKey = []byte("alloc")
	//XXX use or remove
	//allocRunnerStateImmutableKey = []byte("immutable")
	//allocRunnerStateMutableKey   = []byte("mutable")
	//allocRunnerStateAllocDirKey  = []byte("alloc-dir")
)

// State captures the state of the allocation runner.
type State struct {
	sync.RWMutex

	// ClientState captures the overall state of the allocation
	ClientState string

	// ClientDesc is an optional human readable description of the
	// allocations client state
	ClientDesc string

	// DeploymentStatus captures the status of the deployment
	DeploymentStatus *structs.AllocDeploymentStatus
}

type PersistentState struct {
	ClientState string
}

func (s *State) PersistentState() *PersistentState {
	s.RLock()
	defer s.RUnlock()
	return &PersistentState{
		ClientState: s.ClientState,
	}
}

// allocRunnerAllocState is state that only has to be written when the alloc
// changes.
type allocRunnerAllocState struct {
	Alloc *structs.Allocation
}

//XXX do we want to reorg ar/tr state packages into one shared package to avoid
//this intermediary struct?
type LocalAllocState struct {
	Alloc *structs.Allocation
	Tasks map[string]*trstate.LocalState
}

// Restore alloc and task runner state from database.
//XXX only restores alloc right now
func Restore(db *bolt.DB, allocID string) (*LocalAllocState, error) {
	s := &LocalAllocState{}
	err := db.View(func(tx *bolt.Tx) error {
		bkt, err := oldstate.GetAllocationBucket(tx, allocID)
		if err != nil {
			return fmt.Errorf("failed to get allocation bucket: %v", err)
		}

		// Get the state objects
		//var mutable allocRunnerMutableState
		//var immutable allocRunnerImmutableState
		var allocState allocRunnerAllocState
		//var allocDir allocdir.AllocDir

		if err := oldstate.GetObject(bkt, allocRunnerStateAllocKey, &allocState); err != nil {
			return fmt.Errorf("failed to read alloc runner alloc state: %v", err)
		}
		//if err := state.GetObject(bkt, allocRunnerStateImmutableKey, &immutable); err != nil {
		//	return fmt.Errorf("failed to read alloc runner immutable state: %v", err)
		//}
		//if err := state.GetObject(bkt, allocRunnerStateMutableKey, &mutable); err != nil {
		//	return fmt.Errorf("failed to read alloc runner mutable state: %v", err)
		//}
		//if err := state.GetObject(bkt, allocRunnerStateAllocDirKey, &allocDir); err != nil {
		//	return fmt.Errorf("failed to read alloc runner alloc_dir state: %v", err)
		//}

		// Populate the field
		s.Alloc = allocState.Alloc

		// Get the tasks
		tg := s.Alloc.Job.LookupTaskGroup(s.Alloc.TaskGroup)
		//XXX handle tg == nil ?

		s.Tasks = make(map[string]*trstate.LocalState, len(tg.Tasks))

		for _, task := range tg.Tasks {
			taskState, err := trstate.Restore(tx, allocID, task.Name)
			if err != nil {
				return err
			}
			s.Tasks[task.Name] = taskState
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return s, nil
}
