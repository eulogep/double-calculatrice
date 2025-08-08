#!/bin/bash

# 🚀 Script de déploiement GitHub Pages - Calculatrice Pro ESIEA
# Auteur : Euloge Mabiala
# Date : 2024

echo "🚀 Déploiement GitHub Pages - Calculatrice Pro ESIEA"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Vérification de Git
if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérification du statut Git
if [ ! -d ".git" ]; then
    print_error "Ce n'est pas un repository Git. Veuillez initialiser Git d'abord."
    exit 1
fi

print_step "1. Vérification du statut Git..."
git_status=$(git status --porcelain)

if [ -n "$git_status" ]; then
    print_warning "Il y a des changements non commités :"
    echo "$git_status"
    read -p "Voulez-vous continuer ? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Déploiement annulé."
        exit 1
    fi
fi

print_step "2. Vérification de la branche..."
current_branch=$(git branch --show-current)

if [ "$current_branch" != "main" ]; then
    print_warning "Vous n'êtes pas sur la branche main. Branche actuelle : $current_branch"
    read -p "Voulez-vous basculer vers la branche main ? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        print_message "Basculé vers la branche main."
    else
        print_error "Déploiement annulé."
        exit 1
    fi
fi

print_step "3. Ajout des fichiers..."
git add .

print_step "4. Commit des changements..."
commit_message="🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S') - Calculatrice Pro ESIEA"
git commit -m "$commit_message"

print_step "5. Push vers GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    print_message "✅ Push réussi !"
    echo
    echo "🎉 Déploiement en cours..."
    echo "⏳ Attendez 2-5 minutes pour que GitHub Pages se mette à jour."
    echo
    echo "📊 URLs de votre application :"
    echo "   🌐 Production : https://eulogep.github.io/double-calculatrice/"
    echo "   📱 Alternative : https://eulogep.github.io/double-calculatrice/index.html"
    echo
    echo "🔍 Vérification :"
    echo "   1. Allez sur https://github.com/eulogep/double-calculatrice/actions"
    echo "   2. Vérifiez que le workflow 'Deploy to GitHub Pages' s'exécute"
    echo "   3. Attendez que le statut devienne vert"
    echo
    echo "📞 Contact pour les recruteurs :"
    echo "   📧 Email : mabiala@et.esiea.fr"
    echo "   💼 LinkedIn : https://www.linkedin.com/in/euloge-junior-mabiala"
    echo "   🐙 GitHub : https://github.com/eulogep"
    echo
    print_message "🎯 Votre calculatrice pro est maintenant en ligne et prête à impressionner les recruteurs !"
else
    print_error "❌ Erreur lors du push. Vérifiez votre connexion et vos permissions."
    exit 1
fi
