import app from 'flarum/app';

import postMentionPreviews from 'mentions/post-mention-previews';
import mentionedByList from 'mentions/mentioned-by-list';
import postReplyAction from 'mentions/post-reply-action';
import composerAutocomplete from 'mentions/composer-autocomplete';
import NotificationPostMentioned from 'mentions/components/notification-post-mentioned';
import NotificationUserMentioned from 'mentions/components/notification-user-mentioned';

app.initializers.add('mentions', function() {
  // For every mention of a post inside a post's content, set up a hover handler
  // that shows a preview of the mentioned post.
  postMentionPreviews();

  // In the footer of each post, show information about who has replied (i.e.
  // who the post has been mentioned by).
  mentionedByList();

  // Add a 'reply' control to the footer of each post. When clicked, it will
  // open up the composer and add a post mention to its contents.
  postReplyAction();

  // After typing '@' in the composer, show a dropdown suggesting a bunch of
  // posts or users that the user could mention.
  composerAutocomplete();

  app.notificationComponentRegistry['postMentioned'] = NotificationPostMentioned;
  app.notificationComponentRegistry['userMentioned'] = NotificationUserMentioned;
});