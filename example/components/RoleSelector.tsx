import { ChangeEvent, ReactElement } from 'react';
import { usePermission } from 'feature-gate';

type Props = {
  onChange: (role: string) => void,
};

const RoleSelector = (props: Props): ReactElement => {
  const { role } = usePermission("users");

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    props.onChange(e.target.value)
  };

  return (
    <div id="role-selector">
      <span>Select role: </span>
      <select name="role" value={role} onChange={handleChange}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <style jsx>{`
          #role-selector {
            margin: 8px 0;
          }
      `}</style>
    </div>
  )
}

export default RoleSelector
