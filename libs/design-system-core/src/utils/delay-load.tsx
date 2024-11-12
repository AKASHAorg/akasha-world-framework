import * as React from 'react';

export interface IDelayLoad {
  children: React.ReactNode;
  loadAfter?: number;
}

export const DelayLoad: React.FC<IDelayLoad> = ({ children, loadAfter = 300 }) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, loadAfter);
    return () => clearTimeout(timer);
  }, [loadAfter]);

  return <>{show ? children : null}</>;
};
