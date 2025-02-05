import json
import os.path as osp

from ._version import __version__

HERE = osp.abspath(osp.dirname(__file__))

with open(osp.join(HERE, "labextension", "package.json")) as f:
    data = json.load(f)

def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": data["name"]
    }]
