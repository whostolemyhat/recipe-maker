/* declare Backbone and underscore variables so jshint doesn't error
 * see http://www.jshint.com/docs/ 
 */
/* global Backbone */
/* global _ */

(function($, _, Backbone) {

    // JSON - this would be from server
    var recipes = [
        {
            id: '1',
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
            id: '2',
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
        },

        {
            id: '3',
            title: 'Delicious Popcorn',
            img: 'img/popcorn.jpg',
            description: 'Covered in lovely things',
            serves: '6',
            time: '10 minutes',
            ingredients: [
                {
                    name: 'corn',
                    quantity: 'lots of'
                },

                {
                    name: 'gin',
                    quantity: 'some'
                },

                {
                    name: 'chilli powder',
                    quantity: 'lashings of'
                }
            ],
            method: '<p>Add some oil to a pan and fry the corn until popped.</p><p>Add the toppings to taste.</p>',
            user: {
                id: '1',
                name: 'James'
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
        editTemplate: _.template($('#editIngredientTemplate').html()),

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
        editTemplate: _.template($('#editRecipeTemplate').html()),

        initialize: function() {
            this.collection = new IngredientList(this.model.get('ingredients'));
            this.user = new User(this.model.get('user'));
        },

        events: {
            'click .edit': 'editRecipe',
            'click .save': 'saveEdit',
            'click .cancel': 'cancelEdit'
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
            userView.render().$el.insertAfter(this.$el.find('h1'));

            return this;
        },

        editRecipe: function(e) {
            e.preventDefault();
            this.$el.html(this.editTemplate(this.model.toJSON()));
            _.each(this.collection.models, function(item) {
                var ingredientView = new IngredientView({
                    model: item
                });
                this.$el.find('form .edit-ingredient').append(ingredientView.editTemplate(ingredientView.model.toJSON()));
            }, this);
        },

        saveEdit: function(e) {
            e.preventDefault();
            var formData = {};
            var ingredientData = [];
            var prev = this.model.previousAttributes();

            $(e.target).closest('form').find('.ingredient-info').each(function() {
                var ingredient = {
                    quantity: $(this).find('.quantity').val(),
                    name: $(this).find('.ingredient').val()
                };
                ingredientData.push(ingredient);
            });
            console.log(ingredientData);

            // ingredients handled separately
            $(e.target).closest('form').find('input, textarea').filter(function() {
                return $(this).parents('.edit-ingredient').length < 1;
            }).each(function() {
                var el = $(this);
                formData[el.attr('name')] = el.val();
            });

            if(formData.img === '') {
                delete formData.img;
            }
            if(prev.img === '/img/placeholder.jpg') {
                delete prev.img;
            }
            console.log(this.model.get('ingredients'));
            _.each(this.model.get('ingredients'), function(item) {
                // if(item.name === ) {}
            });
            this.model.set(formData);
            this.render();

            _.each(recipes, function(recipe) {
                if(_.isEqual(recipe, prev)) {
                    recipes.splice(_.indexOf(recipes, recipe), 1, formData);
                }
            });
        },

        cancelEdit: function(e) {
            e.preventDefault();
            this.render();
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
            this.on('change:userFilter', function() {
                this.filterByUser();
            }, this);
            this.on('change:recipeFilter', function() {
                this.filterByRecipe();
            }, this);
            this.collection.on('reset', this.render, this);
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
        },

        events: {
            'click .user a': 'setFilter',
            'click .clear-filter': 'setFilter',
            'click .recipe': 'setRecipeFilter'
        },

        // TODO: clean up filtering
        // keep user and recipe separate but remove duplicated code
        setFilter: function(e) {
            e.preventDefault();
            this.userFilter = $(e.currentTarget).data('id');
            this.trigger('change:userFilter');
        },

        filterByUser: function() {
            if(this.userFilter === 'all') {
                $('.filter').addClass('hidden');
                this.collection.reset(recipes);
                recipeRouter.navigate('all');
            } else {
                this.collection.reset(recipes, { silent: true });

                var filterId = '' +this.userFilter;
                var filtered = _.filter(this.collection.models, function(item) {
                    var user = item.get('user');
                    if(user.id === filterId) {
                        $('.filter p').text('Showing all recipes from ' + user.name);
                    }
                    return user.id === filterId;
                });

                this.collection.reset(filtered);
                recipeRouter.navigate('user/' + filterId);
                $('.filter').removeClass('hidden');
            }
        },

        setRecipeFilter: function(e) {
            e.preventDefault();
            this.recipeFilter = $(e.currentTarget).data('id');
            this.trigger('change:recipeFilter');
        },

        filterByRecipe: function() {
            if(this.recipeFilter === 'all') {
                $('.filter').addClass('hidden');
                this.collection.reset(recipes);
                recipeRouter.navigate('all');
            } else {
                this.collection.reset(recipes, { silent: true });

                var filterId = '' + this.recipeFilter;
                var filtered = _.filter(this.collection.models, function(item) {
                    return item.get('id') === filterId;
                });

                this.collection.reset(filtered);
                recipeRouter.navigate('recipe/' + filterId);
                $('.filter p').text('');
                $('.filter').removeClass('hidden');
            }
        },

    });

    var RecipeRouter = Backbone.Router.extend({
        routes: {
            'user/:id': 'userFilter',
            'recipe/:id': 'recipeFilter'
        },

        userFilter:function(id) {
            recipeBookView.userFilter = id;
            recipeBookView.trigger('change:userFilter');
        },

        recipeFilter:function(id) {
            recipeBookView.recipeFilter = id;
            recipeBookView.trigger('change:recipeFilter');
        }
    });

    var recipeBookView = new RecipeBookView();
    var recipeRouter = new RecipeRouter();
    Backbone.history.start();

}(jQuery, _, Backbone));
