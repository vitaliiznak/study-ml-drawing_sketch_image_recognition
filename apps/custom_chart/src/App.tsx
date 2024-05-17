import type { Component } from 'solid-js';
import { css } from '@emotion/css';

const App: Component = () => {
  return (
    <div>
      <header>
        <h1>Custom Chart Demo</h1>
        <div class={css`display: flex;`}>
          <div id="chartContainer"></div>
          <table id="chartDataTable"></table>
        </div>
      </header>
    </div>
  );
};

export default App;
