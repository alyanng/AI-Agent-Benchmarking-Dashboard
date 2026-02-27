import os
import sys
sys.path.insert(0,os.path.dirname(os.path.dirname(__file__)))

from main import safe_int


def test_safe_int_normalNumbers():
    assert safe_int(42)==42
    
def test_safe_safe_int_array():
    assert safe_int("42") == 42
    
def test_safr_safe_None_return0():
    assert safe_int(None) == 0
    
    