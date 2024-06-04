# jupyterlab-collaborative-input

Display collaborative inputs in JupyterLab

## Requirements

- JupyterLab >= 4.0

## Install

To install this package with [`pip`](https://pip.pypa.io/en/stable/) run

```bash
pip install jupyterlab_collaborative_input
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_collaborative_input directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

#### Publishing

Before starting, you'll need to have run: `pip install twine jupyter_packaging`

1. Update the version in `package.json` and update the release date in `CHANGELOG.md`
2. Commit the change in step 1, tag it, then push it

```
git commit -am <msg>
git tag vX.Z.Y
git push && git push --tags
```

3. Create the artifacts

```
rm -rf dist build jupyterlab_collaborative_input/labextension
jlpm run build
python setup.py sdist bdist_wheel
```

4. Test this against the test pypi. You can then install from here to test as well:

```
twine upload --repository-url https://test.pypi.org/legacy/ dist/*
# In a new venv
pip install --index-url https://test.pypi.org/simple/ jupyterlab_collaborative_input
```

5. Upload this to pypi:

```
twine upload dist/*
```

### Uninstall

```bash
pip uninstall jupyterlab_collaborative_input
```
