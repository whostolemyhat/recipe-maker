/* declare Backbone and underscore variables so jshint doesn't error
 * see http://www.jshint.com/docs/ 
 */
/* global Backbone */
/* global _ */

(function($, _, Backbone) {

    var recipes = [
        {
            title: 'Cake',
            description: 'A lovely cake. Delicious!',
            serves: '8',
            time: '2 hours',
            ingredients: [
                {
                    name: 'flour',
                    quantity: '200',
                    unit: 'g'
                },
                {
                    name: 'eggs',
                    quantity: '2'
                },
                {
                    name: 'butter',
                    quantity: '200',
                    unit: 'g'
                },
                {
                    name: 'sugar',
                    quantity: '200',
                    unit: 'g'
                }
            ],
            method: 'Add all the ingredients together and mix them up. Cook in an oven for a bit.',
            user: {
                id: '1',
                name: 'James'
            }
        },

        {
            title: 'Rat Souffle',
            description: 'Rat-flavoured souffle',
            serves: '1',
            time: '20 minutes',
            ingredients: [
                {
                    name: 'rat',
                    quantity: '1'
                },
                {
                    name: 'souffle',
                }
            ],
            method: 'Take one rat. Make it into a souffle.',
            user: {
                id: '6',
                name: 'Archibald'
            }
        }
    ];

    var Ingredient = Backbone.Model.extend({
        defaults: {
            name: '',
            quantity: '1',
            unit: ''
        }
    });

    var IngredientList = Backbone.Collection.extend({
        model: Ingredient
    });

    var IngredientView = Backbone.View.extend({
        template: $('#ingredientTemplate').html(),

        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        }
    });


    var User = Backbone.Model.extend({
        defaults: {
            id: '0',
            name: 'Guest'
        }
    });

    var UserView = Backbone.View.extend({
        template: $('#userTemplate').html(),

        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        }
    });


    var Recipe = Backbone.Model.extend({
        defaults: {
            img: 'img/placeholder.jpg'
        }
    });

    var RecipeView = Backbone.View.extend({
        tagName: 'article',
        className: 'recipe-container',
        template: $('#recipeTemplate').html(),

        initialize: function() {
            this.collection = new IngredientList(this.model.get('ingredients'));
            this.user = new User(this.model.get('user'));
        },

        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));

            _.each(this.collection.models, function(item) {
                var ingredientView = new IngredientView({
                    model: item
                });
                this.$el.find('ul').append(ingredientView.render().el);
            }, this);

            var userView = new UserView({
                model: this.user
            });
            userView.render().$el.insertBefore(this.$el.find('.description'));

            return this;
        }
    });

    var RecipeBook = Backbone.Collection.extend({
        model: Recipe
    });

    var RecipeBookView = Backbone.View.extend({
        el: $('#recipes'),

        initialize: function() {
            this.collection = new RecipeBook(recipes);
            this.render();
        },

        render: function() {
            this.$el.find('article').remove();

            _.each(this.collection.models, function(item) {
                this.renderRecipe(item);
            }, this);
        },

        renderRecipe: function(recipe) {
            var recipeView = new RecipeView({
                model: recipe
            });
            this.$el.append(recipeView.render().el);
        }
    });


    new RecipeBookView();

}(jQuery, _, Backbone));
