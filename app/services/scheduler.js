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
      if (this.lastChangedMode !== currentMode) {
          this.lastChangedMode = currentMode;
          console.log('Synchronizing with mode [', currentMode, ']');
      }
    }
  }

};