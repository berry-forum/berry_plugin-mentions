import { extend } from 'flarum/extension-utils';
import ComposerBody from 'flarum/components/composer-body';
import ComposerReply from 'flarum/components/composer-reply';
import ComposerEdit from 'flarum/components/composer-edit';
import avatar from 'flarum/helpers/avatar';
import username from 'flarum/helpers/username';

import AutocompleteDropdown from 'mentions/components/autocomplete-dropdown';

export default function() {
  extend(ComposerBody.prototype, 'onload', function(original, element, isInitialized, context) {
    if (isInitialized) return;

    var composer = this;
    var $container = $('<div class="mentions-dropdown-container"></div>');
    var dropdown = new AutocompleteDropdown({items: []});

    this.$('textarea')
      .after($container)
      .on('keydown', dropdown.navigate.bind(dropdown))
      .on('input', function() {
        var cursor = this.selectionStart;

        if (this.selectionEnd - cursor > 0) return;

        // Search backwards from the cursor for an '@' symbol, without any
        // intervening whitespace. If we find one, we will want to show the
        // autocomplete dropdown!
        var value = this.value;
        var mentionStart;
        for (var i = cursor - 1; i >= 0; i--) {
          var character = value.substr(i, 1);
          if (/\s/.test(character)) break;
          if (character == '@') {
            mentionStart = i + 1;
            break;
          }
        }

        dropdown.hide();

        if (mentionStart) {
          var typed = value.substring(mentionStart, cursor).toLowerCase();
          var suggestions = [];

          var applySuggestion = function(replacement) {
            replacement += ' ';

            var content = composer.content();
            composer.editor.setContent(content.substring(0, mentionStart - 1)+replacement+content.substr(cursor));

            var index = mentionStart + replacement.length;
            composer.editor.setSelectionRange(index, index);

            dropdown.hide();
          };

          var makeSuggestion = function(user, replacement, index, content) {
            return m('a[href=javascript:;].post-preview', {
              onclick: () => applySuggestion(replacement),
              onmouseover: () => dropdown.setIndex(index)
            }, m('div.post-preview-content', [
              avatar(user),
              username(user), ' ',
              content
            ]));
          };

          // If the user is replying to a discussion, or if they are editing a
          // post, then we can suggest other posts in the discussion to mention.
          // We will add the 5 most recent comments in the discussion which
          // match any username characters that have been typed.
          var composerPost = composer.props.post;
          var discussion = (composerPost && composerPost.discussion()) || composer.props.discussion;
          if (discussion) {
            discussion.posts()
              .filter(post => post && post.contentType() === 'comment' && (!composerPost || post.number() < composerPost.number()))
              .sort((a, b) => b.time() - a.time())
              .filter(post => {
                var user = post.user();
                return user && user.username().toLowerCase().substr(0, typed.length) === typed;
              })
              .splice(0, 5)
              .forEach((post, i) => {
                var user = post.user();
                suggestions.push(
                  makeSuggestion(user, '@'+user.username()+'#'+post.number(), i, [
                    'Reply to #', post.number(), ' — ',
                    post.excerpt()
                  ])
                );
              });
          }

          // If the user has started to type a username, then suggest users
          // matching that username.
          if (typed) {
            app.store.all('users').forEach((user, i) => {
              if (user.username().toLowerCase().substr(0, typed.length) !== typed) return;

              suggestions.push(
                makeSuggestion(user, '@'+user.username(), i, '@mention')
              );
            });
          }

          if (suggestions.length) {
            dropdown.props.items = suggestions;
            m.render($container[0], dropdown.view());

            var coordinates = getCaretCoordinates(this, mentionStart);
            dropdown.show(coordinates.left, coordinates.top + 15);

            dropdown.setIndex(0);
            dropdown.$().scrollTop(0);
          }
        }
      });
  });
}