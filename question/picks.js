// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * JavaScript library for dealing with the question picks.
 *
 * This script, and the YUI libraries that it needs, are inluded by
 * the $PAGE->requires->js calls in question_get_html_head_contributions in lib/questionlib.php.
 *
 * @package    moodlecore
 * @subpackage questionengine
 * @copyright  2010 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

M.core_question_picks = {
    pickattributes: null,
    actionurl: null,
    pickclass: null,
    listeners: [],

    init: function(Y, actionurl, pickattributes, pickclass) {
        M.core_question_picks.pickattributes = pickattributes;
        M.core_question_picks.pickclass = pickclass;
        M.core_question_picks.actionurl = actionurl;
        Y.all('div.pick').each(function(pickdiv) {
            var checkbox = pickdiv.one('input[type=checkbox]');
            if (!checkbox) {
                return;
            }

            var input = Y.Node.create('<input type="hidden" class="questionpickvalue" />');
            input.set('id', checkbox.get('id'));
            input.set('name', checkbox.get('name'));
            input.set('value', checkbox.get('checked') ? 1 : 0);

            // Create an image input to replace the img tag.
            var button = Y.Node.create('<input type="button" id="pickbutton"/>');
            M.core_question_picks.update_pick(input, button);

            checkbox.remove();
            pickdiv.append(input);
            pickdiv.append(button);
        });

        Y.delegate('click', function(e) {
            var input = this.one('input.questionpickvalue');
            input.set('value', 1 - input.get('value'));
            M.core_question_picks.update_pick(input, this.one('#pickbutton'));
            var postdata = this.one('input.questionpickpostdata').get('value') +
                    input.get('value');

            e.halt();
            Y.io(M.core_question_picks.actionurl, {method: 'POST', 'data': postdata});
            M.core_question_picks.fire_listeners(postdata);
        }, document.body, 'div.pick');
    },

    update_pick: function(input, button) {
        var value = input.get('value');
        var oposite_val = 1-value;
        button.setAttrs(M.core_question_picks.pickattributes[value]);
        button.replaceClass(M.core_question_picks.pickclass[oposite_val],M.core_question_picks.pickclass[value]);
    },

    add_listener: function(listener) {
        M.core_question_picks.listeners.push(listener);
    },

    fire_listeners: function(postdata) {
        for (var i = 0; i < M.core_question_picks.listeners.length; i++) {
            M.core_question_picks.listeners[i](
                postdata.match(/\bqubaid=(\d+)\b/)[1],
                postdata.match(/\bslot=(\d+)\b/)[1],
                postdata.match(/\bnewstate=(\d+)\b/)[1]
            );
        }
    }
};
