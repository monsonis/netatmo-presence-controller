module.exports = {
  lastChangedMode: undefined,

  getNewMode: function(usersAtHome, currentMode) {
    var suggestedMode = this.getSuggestedMode(usersAtHome, currentMode);
    this.synchronizeWithMode(currentMode, suggestedMode);
    if (!this.userHasChangedMode(currentMode) && suggestedMode && suggestedMode != currentMode) {
      return suggestedMode;
    }
    return false;
  },
  
  setNewMode: function(newMode) {
    if (this.lastChangedMode !== newMode) {
      this.lastChangedMode = newMode;
      console.log('Synchronizing with mode [', newMode, ']');
    }
  },

  getSuggestedMode: function(usersAtHome, currentMode) {
    if (currentMode != 'program' && currentMode != 'away') {
      return null;
    }
    return (usersAtHome.length) ? 'program' : 'away';
  },

  userHasChangedMode: function(currentMode) {
    return currentMode !== this.lastChangedMode;
  },

  synchronizeWithMode: function(currentMode, suggestedMode) {
    if (this.lastChangedMode === undefined || currentMode == suggestedMode) {
      this.setNewMode(currentMode);
    }
  }

};