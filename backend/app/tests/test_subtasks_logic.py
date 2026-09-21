from app.subtasks import derive_parent_done


def test_parent_with_no_subtasks_is_not_derived():
    assert derive_parent_done([]) is False


def test_parent_is_done_when_all_subtasks_done():
    assert derive_parent_done([True, True, True]) is True


def test_parent_is_not_done_when_any_subtask_incomplete():
    assert derive_parent_done([True, False, True]) is False


def test_parent_is_not_done_when_no_subtasks_done():
    assert derive_parent_done([False, False]) is False
