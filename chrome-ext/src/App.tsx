import * as React from 'react';

interface State {
  active: boolean;
}

export class App extends React.Component<void, State> {
  constructor(props: void) {
    super(props);

    this.state = {
      active: false
    };
  }

  render() {
    const { state, handleToggleActivate } = this;

    const title = state.active ? 'activated' : 'deactivated';
    const btn = state.active ? 'Deactivate' : 'Activate';

    return (
      <div>
        <h1>This is a React test - {title}</h1>
        <button onClick={handleToggleActivate}>{btn}</button>
      </div>
    )
  }

  handleToggleActivate = () => {
    this.setState({
      ...this.state,
      active: !this.state.active
    });
  };
}
