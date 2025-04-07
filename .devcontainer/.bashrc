# Custom .bashrc for development container

# Enable color prompt
force_color_prompt=yes

# Set custom PS1 prompt with git branch
parse_git_branch() {
  git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'
}

PS1='\[\033[01;32m\]\u@dev-container\[\033[00m\]:\[\033[01;34m\]\w\[\033[01;31m\] $(parse_git_branch)\[\033[00m\]\$ '

# Set aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias cls='clear'
alias ..='cd ..'
alias ...='cd ../..'

# Node.js specific aliases
alias nr='npm run'
alias ni='npm install'
alias nid='npm install --save-dev'
alias ns='npm start'
alias nd='npm run dev'
alias nt='npm test'
alias nb='npm run build'

# Set editor
export EDITOR=vim

# Add project bin to path
export PATH="$PATH:/workspace/node_modules/.bin"

# Set history settings
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth

# Custom welcome message
echo "🚀 OpenAI Chat App Development Environment"
echo "---------------------------------------"
echo "📂 Current directory: $(pwd)"
echo "📅 $(date)"
echo "Type 'help' for available commands"
echo ""