import { useMemo } from 'react';
import uuid from 'uuid';

const useGetFormName = (stage) => {
  const formPrefix = useMemo(() => uuid(), [stage.id]);

  const getFormName = (uid) => (uid ? `${formPrefix}_${uid}` : formPrefix);

  return getFormName;
};

export default useGetFormName;
