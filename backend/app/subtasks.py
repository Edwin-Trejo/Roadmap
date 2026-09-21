def derive_parent_done(subtask_done_states: list[bool]) -> bool:
    return bool(subtask_done_states) and all(subtask_done_states)
