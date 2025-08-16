import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

type TabData = {
  value: string;
  caption: string;
  component: React.ReactNode;
};

interface TabsProps {
  tabs: TabData[];
}

export default function Tabs({ tabs }: TabsProps) {
  const [value, setValue] = React.useState(tabs[0].value);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="App tabs">
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.caption} value={tab.value} />
            ))}
          </TabList>
        </Box>
        {tabs.map((tab) => (
          <TabPanel key={tab.value} value={tab.value}>
            {tab.component}
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
}