/* eslint-disable no-template-curly-in-string */
/* @flow */

const babel = require('@babel/core');
const dedent = require('dedent');
const serializer = require('../__utils__/linaria-snapshot-serializer');

expect.addSnapshotSerializer(serializer);

const transpile = input =>
  babel.transformAsync(input, {
    presets: [[require.resolve('../babel'), { evaluate: false }]],
    plugins: ['@babel/plugin-syntax-jsx'],
    filename: '/app/index.js',
  });

it('transpiles styled template literal with object', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const Title = styled.h1\`
      font-size: 14px;
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('transpiles styled template literal with function and tag', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const Title = styled('h1')\`
      font-size: 14px;
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('transpiles styled template literal with function and component', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const Title = styled(Heading)\`
      font-size: 14px;
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('outputs valid CSS classname', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const ᾩPage$Title = styled.h1\`
      font-size: 14px;
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('evaluates and inlines expressions in scope', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const color = 'blue';

    const Title = styled.h1\`
      color: ${'${color}'};
      width: ${'${100 / 3}'}%;
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('inlines object styles as CSS string', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const cover = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      opacity: 1,
      minHeight: 420,

      '@media (min-width: 200px)': {
        WebkitOpacity: .8,
        MozOpacity: .8,
        msOpacity: .8,
        OOpacity: .8,
        WebkitBorderRadius: 2,
        MozBorderRadius: 2,
        msBorderRadius: 2,
        OBorderRadius: 2,
        WebkitTransition: '400ms',
        MozTransition: '400ms',
        OTransition: '400ms',
        msTransition: '400ms',
      }
    };

    const Title = styled.h1\`
      ${'${cover}'}
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('replaces unknown expressions with CSS custom properties', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const Title = styled.h1\`
      font-size: ${'${size}'}px;
      color: ${'${props => props.color}'};
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('handles interpolation followed by unit', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const Title = styled.h1\`
      font-size: ${'${size}'}em;
      text-shadow: black 1px ${'${shadow}'}px, white -2px -2px;
      margin: ${'${size}'}px;
      width: calc(2 * ${'${props => props.width}'}vw);
      height: ${'${props => { if (true) { return props.height } else { return 200 } }}'}px;
      grid-template-columns: ${'${unit}'}fr 1fr 1fr ${'${unit}'}fr;
      border-radius: ${'${function(props) { return 200 }}'}px
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('uses the same custom property for the same identifier', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const Box = styled.div\`
      height: ${'${size}'}px;
      width: ${'${size}'}px;
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('uses the same custom property for the same expression', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const Box = styled.div\`
      height: ${'${props => props.size}'}px;
      width: ${'${props => props.size}'}px;
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('handles nested blocks', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const Button = styled.button\`
      font-family: ${'${regular}'};

      &:hover {
        border-color: blue;
      }

      @media (max-width: 200px) {
        width: 100%;
      }
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('prevents class name collision', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const Title = styled.h1\`
      font-size: ${'${size}'}px;
      color: ${'${props => props.color}'}
    \`;

    function more() {
      const Title = styled.h1\`
        font-family: ${'${regular}'};
      \`;
    }
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('throws when not attached to a variable', async () => {
  expect.assertions(1);

  try {
    await transpile(
      dedent`
      styled.h1\`
        font-size: ${'${size}'}px;
        color: ${'${props => props.color}'}
      \`;
      `
    );
  } catch (e) {
    expect(e.message).toMatchSnapshot();
  }
});

it('does not output CSS if none present', async () => {
  const { code, metadata } = await transpile(
    dedent`
      const number = 42;

      const title = String.raw\`This is something\`;
      `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('transpiles css template literal', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const title = css\`
      font-size: 14px;
    \`;
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('handles css template literal in object property', async () => {
  const { code, metadata } = await transpile(
    dedent`
    const components = {
      title: css\`
        font-size: 14px;
      \`
    };
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('handles css template literal in JSX element', async () => {
  const { code, metadata } = await transpile(
    dedent`
    <Title class={css\` font-size: 14px; \`} />
    `
  );

  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});

it('throws when contains dynamic expression without evaluate: true in css tag', async () => {
  expect.assertions(1);

  try {
    await transpile(
      dedent`
      const title = css\`
        font-size: ${'${size}'}px;
      \`;
      `
    );
  } catch (e) {
    expect(e.message).toMatchSnapshot();
  }
});
