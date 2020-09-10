<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

use Flarum\Database\Schema;
use Flarum\Database\Migration;

if (Schema::hasTable('mentions_posts')) {
    return Migration::renameTable('mentions_posts', 'post_mentions_post');
}
