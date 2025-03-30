import React, { useState } from 'react';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuButton,
  useId,
} from '@fluentui/react-components';
import { 
  NavigationRegular, 
  SettingsRegular,
  InfoRegular,
  DataUsageRegular,
} from '@fluentui/react-icons';
import { MCPConfigModal } from '../settings/MCPConfigModal';

export const HeaderMenu = ({ onOpenSettings, onAbout }) => {
  const menuId = useId('app-menu');
  const [isMCPModalOpen, setIsMCPModalOpen] = useState(false);
  
  const handleOpenMCPConfig = () => {
    setIsMCPModalOpen(true);
  };
  
  const handleCloseMCPConfig = () => {
    setIsMCPModalOpen(false);
  };
  
  return (
    <>
      <Menu id={menuId}>
        <MenuTrigger>
          <MenuButton icon={<NavigationRegular />}>Menu</MenuButton>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem icon={<SettingsRegular />} onClick={onOpenSettings}>
              Settings
            </MenuItem>
            <MenuItem icon={<DataUsageRegular />} onClick={handleOpenMCPConfig}>
              MCP Configuration
            </MenuItem>
            {onAbout && (
              <MenuItem icon={<InfoRegular />} onClick={onAbout}>
                About
              </MenuItem>
            )}
          </MenuList>
        </MenuPopover>
      </Menu>
      
      {/* MCP Configuration Modal */}
      <MCPConfigModal 
        isOpen={isMCPModalOpen} 
        onClose={handleCloseMCPConfig} 
      />
    </>
  );
};