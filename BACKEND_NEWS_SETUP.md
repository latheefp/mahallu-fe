# CakePHP Backend - News/Information Management System

This guide shows you how to add a news/information management system to your CakePHP backend.

## Table of Contents
1. [Database Migration](#database-migration)
2. [Model Setup](#model-setup)
3. [API Controller](#api-controller)
4. [Admin Controller](#admin-controller)
5. [Admin Views](#admin-views)
6. [Routes Configuration](#routes-configuration)

---

## 1. Database Migration

### Create News Table

Create migration file: `config/Migrations/YYYYMMDDHHMMSS_CreateNews.php`

```php
<?php
use Migrations\AbstractMigration;

class CreateNews extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('news');
        
        $table->addColumn('title', 'string', [
            'limit' => 255,
            'null' => false,
        ]);
        
        $table->addColumn('content', 'text', [
            'null' => false,
        ]);
        
        $table->addColumn('excerpt', 'text', [
            'null' => true,
        ]);
        
        $table->addColumn('image_url', 'string', [
            'limit' => 500,
            'null' => true,
        ]);
        
        $table->addColumn('category', 'string', [
            'limit' => 100,
            'null' => false,
            'default' => 'General',
        ]);
        
        $table->addColumn('author_id', 'integer', [
            'null' => false,
        ]);
        
        $table->addColumn('author_name', 'string', [
            'limit' => 255,
            'null' => true,
        ]);
        
        $table->addColumn('published_date', 'datetime', [
            'null' => false,
        ]);
        
        $table->addColumn('view_count', 'integer', [
            'default' => 0,
            'null' => false,
        ]);
        
        $table->addColumn('is_featured', 'boolean', [
            'default' => false,
            'null' => false,
        ]);
        
        $table->addColumn('status', 'string', [
            'limit' => 20,
            'default' => 'draft',
            'null' => false,
        ]);
        
        $table->addColumn('created', 'datetime', [
            'default' => 'CURRENT_TIMESTAMP',
            'null' => false,
        ]);
        
        $table->addColumn('modified', 'datetime', [
            'default' => 'CURRENT_TIMESTAMP',
            'null' => false,
        ]);
        
        $table->addIndex(['status']);
        $table->addIndex(['category']);
        $table->addIndex(['published_date']);
        $table->addIndex(['is_featured']);
        $table->addIndex(['author_id']);
        
        $table->create();
    }
}
```

Run migration:
```bash
bin/cake migrations migrate
```

---

## 2. Model Setup

### NewsTable Model

Create `src/Model/Table/NewsTable.php`:

```php
<?php
namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class NewsTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('news');
        $this->setDisplayField('title');
        $this->setPrimaryKey('id');

        $this->addBehavior('Timestamp');

        // Associations
        $this->belongsTo('Users', [
            'foreignKey' => 'author_id',
            'joinType' => 'INNER',
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('id')
            ->allowEmptyString('id', null, 'create');

        $validator
            ->scalar('title')
            ->maxLength('title', 255)
            ->requirePresence('title', 'create')
            ->notEmptyString('title', 'Title is required');

        $validator
            ->scalar('content')
            ->requirePresence('content', 'create')
            ->notEmptyString('content', 'Content is required');

        $validator
            ->scalar('excerpt')
            ->allowEmptyString('excerpt');

        $validator
            ->scalar('image_url')
            ->maxLength('image_url', 500)
            ->allowEmptyString('image_url');

        $validator
            ->scalar('category')
            ->maxLength('category', 100)
            ->requirePresence('category', 'create')
            ->notEmptyString('category');

        $validator
            ->integer('author_id')
            ->requirePresence('author_id', 'create')
            ->notEmptyString('author_id');

        $validator
            ->dateTime('published_date')
            ->requirePresence('published_date', 'create')
            ->notEmptyDateTime('published_date');

        $validator
            ->integer('view_count')
            ->allowEmptyString('view_count');

        $validator
            ->boolean('is_featured')
            ->allowEmptyString('is_featured');

        $validator
            ->scalar('status')
            ->inList('status', ['draft', 'published', 'archived'])
            ->requirePresence('status', 'create')
            ->notEmptyString('status');

        return $validator;
    }

    public function findPublished($query)
    {
        return $query->where([
            'News.status' => 'published',
            'News.published_date <=' => date('Y-m-d H:i:s')
        ]);
    }

    public function findFeatured($query)
    {
        return $query
            ->find('published')
            ->where(['News.is_featured' => true]);
    }

    public function incrementViewCount($id)
    {
        $this->updateAll(
            ['view_count = view_count + 1'],
            ['id' => $id]
        );
    }
}
```

### News Entity

Create `src/Model/Entity/News.php`:

```php
<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

class News extends Entity
{
    protected $_accessible = [
        'title' => true,
        'content' => true,
        'excerpt' => true,
        'image_url' => true,
        'category' => true,
        'author_id' => true,
        'author_name' => true,
        'published_date' => true,
        'view_count' => true,
        'is_featured' => true,
        'status' => true,
        'created' => true,
        'modified' => true,
        'user' => true,
    ];

    protected $_hidden = [];
}
```

---

## 3. API Controller

Create `src/Controller/Api/NewsController.php`:

```php
<?php
namespace App\Controller\Api;

use App\Controller\AppController;
use Cake\Event\EventInterface;

class NewsController extends AppController
{
    public function beforeFilter(EventInterface $event)
    {
        parent::beforeFilter($event);
        
        // Allow public access to view methods
        $this->Authentication->addUnauthenticatedActions([
            'index', 'view', 'related', 'incrementView'
        ]);
    }

    /**
     * Get all published news
     * GET /api/news
     */
    public function index()
    {
        $this->request->allowMethod(['get']);
        
        $page = (int) $this->request->getQuery('page', 1);
        $limit = (int) $this->request->getQuery('limit', 20);
        $category = $this->request->getQuery('category');
        $status = $this->request->getQuery('status', 'published');
        
        $query = $this->News->find()
            ->contain(['Users'])
            ->where(['News.status' => $status])
            ->order(['News.published_date' => 'DESC', 'News.created' => 'DESC']);
        
        if ($category && $category !== 'all') {
            $query->where(['News.category' => $category]);
        }
        
        $total = $query->count();
        
        $news = $query
            ->limit($limit)
            ->page($page)
            ->toArray();
        
        $this->set([
            'success' => true,
            'data' => $news,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit)
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'data', 'pagination']);
    }

    /**
     * Get single news item
     * GET /api/news/:id
     */
    public function view($id)
    {
        $this->request->allowMethod(['get']);
        
        $news = $this->News->get($id, [
            'contain' => ['Users']
        ]);
        
        $this->set([
            'success' => true,
            'data' => $news
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'data']);
    }

    /**
     * Get related news articles
     * GET /api/news/:id/related
     */
    public function related($id)
    {
        $this->request->allowMethod(['get']);
        
        $limit = (int) $this->request->getQuery('limit', 3);
        
        $currentNews = $this->News->get($id);
        
        $related = $this->News->find('published')
            ->where([
                'News.id !=' => $id,
                'News.category' => $currentNews->category
            ])
            ->order(['News.published_date' => 'DESC'])
            ->limit($limit)
            ->toArray();
        
        $this->set([
            'success' => true,
            'data' => $related
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'data']);
    }

    /**
     * Increment view count
     * POST /api/news/:id/view
     */
    public function incrementView($id)
    {
        $this->request->allowMethod(['post']);
        
        $this->News->incrementViewCount($id);
        
        $this->set([
            'success' => true,
            'message' => 'View count updated'
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'message']);
    }

    /**
     * Create news (Admin only)
     * POST /api/news
     */
    public function add()
    {
        $this->request->allowMethod(['post']);
        
        $user = $this->request->getAttribute('identity');
        
        $data = $this->request->getData();
        $data['author_id'] = $user['id'];
        $data['author_name'] = $user['name'] ?? '';
        
        $news = $this->News->newEntity($data);
        
        if ($this->News->save($news)) {
            $this->set([
                'success' => true,
                'message' => 'News article created successfully',
                'data' => $news
            ]);
        } else {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Failed to create news article',
                'errors' => $news->getErrors()
            ]);
        }
        $this->viewBuilder()->setOption('serialize', ['success', 'message', 'data', 'errors']);
    }

    /**
     * Update news (Admin only)
     * PUT /api/news/:id
     */
    public function edit($id)
    {
        $this->request->allowMethod(['put', 'patch']);
        
        $news = $this->News->get($id);
        $news = $this->News->patchEntity($news, $this->request->getData());
        
        if ($this->News->save($news)) {
            $this->set([
                'success' => true,
                'message' => 'News article updated successfully',
                'data' => $news
            ]);
        } else {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Failed to update news article',
                'errors' => $news->getErrors()
            ]);
        }
        $this->viewBuilder()->setOption('serialize', ['success', 'message', 'data', 'errors']);
    }

    /**
     * Delete news (Admin only)
     * DELETE /api/news/:id
     */
    public function delete($id)
    {
        $this->request->allowMethod(['delete']);
        
        $news = $this->News->get($id);
        
        if ($this->News->delete($news)) {
            $this->set([
                'success' => true,
                'message' => 'News article deleted successfully'
            ]);
        } else {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Failed to delete news article'
            ]);
        }
        $this->viewBuilder()->setOption('serialize', ['success', 'message']);
    }

    /**
     * Upload image
     * POST /api/news/upload-image
     */
    public function uploadImage()
    {
        $this->request->allowMethod(['post']);
        
        if (!$this->request->getData('image')) {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'No image provided'
            ]);
            $this->viewBuilder()->setOption('serialize', ['success', 'message']);
            return;
        }
        
        $image = $this->request->getData('image');
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($image->getClientMediaType(), $allowedTypes)) {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
            ]);
            $this->viewBuilder()->setOption('serialize', ['success', 'message']);
            return;
        }
        
        // Generate unique filename
        $extension = pathinfo($image->getClientFilename(), PATHINFO_EXTENSION);
        $filename = uniqid('news_') . '.' . $extension;
        $uploadPath = WWW_ROOT . 'uploads' . DS . 'news' . DS;
        
        // Create directory if it doesn't exist
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }
        
        // Move uploaded file
        $destination = $uploadPath . $filename;
        $image->moveTo($destination);
        
        $imageUrl = '/uploads/news/' . $filename;
        
        $this->set([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'data' => [
                'url' => $imageUrl
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'message', 'data']);
    }
}
```

---

## 4. Admin Controller

Create `src/Controller/Admin/NewsController.php`:

```php
<?php
namespace App\Controller\Admin;

use App\Controller\AppController;

class NewsController extends AppController
{
    public function index()
    {
        $this->paginate = [
            'contain' => ['Users'],
            'order' => ['News.created' => 'DESC'],
            'limit' => 20
        ];
        
        $status = $this->request->getQuery('status');
        $category = $this->request->getQuery('category');
        
        $conditions = [];
        if ($status) {
            $conditions['News.status'] = $status;
        }
        if ($category) {
            $conditions['News.category'] = $category;
        }
        
        $query = $this->News->find()->where($conditions);
        $news = $this->paginate($query);
        
        $categories = $this->News->find()
            ->select(['category'])
            ->distinct(['category'])
            ->toArray();
        
        $this->set(compact('news', 'categories'));
    }

    public function view($id = null)
    {
        $news = $this->News->get($id, [
            'contain' => ['Users'],
        ]);
        
        $this->set(compact('news'));
    }

    public function add()
    {
        $news = $this->News->newEmptyEntity();
        
        if ($this->request->is('post')) {
            $data = $this->request->getData();
            $data['author_id'] = $this->Authentication->getIdentity()->id;
            $data['author_name'] = $this->Authentication->getIdentity()->name;
            
            $news = $this->News->patchEntity($news, $data);
            
            if ($this->News->save($news)) {
                $this->Flash->success(__('The news article has been saved.'));
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error(__('The news article could not be saved. Please, try again.'));
        }
        
        $users = $this->News->Users->find('list', ['limit' => 200]);
        $this->set(compact('news', 'users'));
    }

    public function edit($id = null)
    {
        $news = $this->News->get($id, [
            'contain' => [],
        ]);
        
        if ($this->request->is(['patch', 'post', 'put'])) {
            $news = $this->News->patchEntity($news, $this->request->getData());
            
            if ($this->News->save($news)) {
                $this->Flash->success(__('The news article has been saved.'));
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error(__('The news article could not be saved. Please, try again.'));
        }
        
        $users = $this->News->Users->find('list', ['limit' => 200]);
        $this->set(compact('news', 'users'));
    }

    public function delete($id = null)
    {
        $this->request->allowMethod(['post', 'delete']);
        $news = $this->News->get($id);
        
        if ($this->News->delete($news)) {
            $this->Flash->success(__('The news article has been deleted.'));
        } else {
            $this->Flash->error(__('The news article could not be deleted. Please, try again.'));
        }
        
        return $this->redirect(['action' => 'index']);
    }
}
```

---

## 5. Admin Views

### Index View

Create `templates/Admin/News/index.php`:

```php
<div class="news index content">
    <h3><?= __('News Articles') ?></h3>
    
    <div class="actions">
        <?= $this->Html->link(__('New News Article'), ['action' => 'add'], ['class' => 'button']) ?>
    </div>
    
    <!-- Filters -->
    <div class="filters">
        <?= $this->Form->create(null, ['type' => 'get']) ?>
        <?= $this->Form->control('status', ['options' => ['published' => 'Published', 'draft' => 'Draft', 'archived' => 'Archived'], 'empty' => 'All Statuses']) ?>
        <?= $this->Form->control('category', ['options' => array_column($categories, 'category', 'category'), 'empty' => 'All Categories']) ?>
        <?= $this->Form->button(__('Filter')) ?>
        <?= $this->Form->end() ?>
    </div>
    
    <div class="table-responsive">
        <table>
            <thead>
                <tr>
                    <th><?= $this->Paginator->sort('id') ?></th>
                    <th><?= $this->Paginator->sort('title') ?></th>
                    <th><?= $this->Paginator->sort('category') ?></th>
                    <th><?= $this->Paginator->sort('status') ?></th>
                    <th><?= $this->Paginator->sort('is_featured', 'Featured') ?></th>
                    <th><?= $this->Paginator->sort('view_count', 'Views') ?></th>
                    <th><?= $this->Paginator->sort('published_date') ?></th>
                    <th><?= $this->Paginator->sort('created') ?></th>
                    <th class="actions"><?= __('Actions') ?></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($news as $newsItem): ?>
                <tr>
                    <td><?= $this->Number->format($newsItem->id) ?></td>
                    <td><?= h($newsItem->title) ?></td>
                    <td><?= h($newsItem->category) ?></td>
                    <td>
                        <span class="badge badge-<?= $newsItem->status === 'published' ? 'success' : 'warning' ?>">
                            <?= h($newsItem->status) ?>
                        </span>
                    </td>
                    <td><?= $newsItem->is_featured ? '⭐' : '' ?></td>
                    <td><?= $this->Number->format($newsItem->view_count) ?></td>
                    <td><?= h($newsItem->published_date) ?></td>
                    <td><?= h($newsItem->created) ?></td>
                    <td class="actions">
                        <?= $this->Html->link(__('View'), ['action' => 'view', $newsItem->id]) ?>
                        <?= $this->Html->link(__('Edit'), ['action' => 'edit', $newsItem->id]) ?>
                        <?= $this->Form->postLink(__('Delete'), ['action' => 'delete', $newsItem->id], ['confirm' => __('Are you sure you want to delete # {0}?', $newsItem->id)]) ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    
    <div class="paginator">
        <ul class="pagination">
            <?= $this->Paginator->first('<< ' . __('first')) ?>
            <?= $this->Paginator->prev('< ' . __('previous')) ?>
            <?= $this->Paginator->numbers() ?>
            <?= $this->Paginator->next(__('next') . ' >') ?>
            <?= $this->Paginator->last(__('last') . ' >>') ?>
        </ul>
        <p><?= $this->Paginator->counter(__('Page {{page}} of {{pages}}, showing {{current}} record(s) out of {{count}} total')) ?></p>
    </div>
</div>
```

### Add/Edit Form

Create `templates/Admin/News/add.php` and `edit.php`:

```php
<div class="news form content">
    <?= $this->Form->create($news, ['type' => 'file']) ?>
    <fieldset>
        <legend><?= __('Add News Article') ?></legend>
        <?php
            echo $this->Form->control('title', ['required' => true]);
            echo $this->Form->control('excerpt', ['type' => 'textarea', 'rows' => 3]);
            echo $this->Form->control('content', ['type' => 'textarea', 'rows' => 10, 'required' => true, 'class' => 'editor']);
            echo $this->Form->control('category', ['required' => true, 'options' => [
                'Announcements' => 'Announcements',
                'Events' => 'Events',
                'Community' => 'Community',
                'Programs' => 'Programs',
                'Updates' => 'Updates'
            ]]);
            echo $this->Form->control('image_url', ['type' => 'text', 'label' => 'Image URL']);
            echo $this->Form->control('published_date', ['type' => 'datetime', 'required' => true]);
            echo $this->Form->control('status', ['options' => [
                'draft' => 'Draft',
                'published' => 'Published',
                'archived' => 'Archived'
            ], 'required' => true]);
            echo $this->Form->control('is_featured', ['type' => 'checkbox']);
        ?>
    </fieldset>
    <?= $this->Form->button(__('Submit')) ?>
    <?= $this->Form->end() ?>
</div>

<script src="https://cdn.ckeditor.com/4.16.2/standard/ckeditor.js"></script>
<script>
    CKEDITOR.replace('content');
</script>
```

---

## 6. Routes Configuration

Add to `config/routes.php`:

```php
// API Routes for News
$routes->prefix('Api', function ($routes) {
    $routes->setExtensions(['json']);
    
    // Public news endpoints
    $routes->connect('/news', ['controller' => 'News', 'action' => 'index']);
    $routes->connect('/news/:id', ['controller' => 'News', 'action' => 'view'])
        ->setPass(['id'])
        ->setPatterns(['id' => '\d+']);
    $routes->connect('/news/:id/related', ['controller' => 'News', 'action' => 'related'])
        ->setPass(['id']);
    $routes->connect('/news/:id/view', ['controller' => 'News', 'action' => 'incrementView'])
        ->setPass(['id']);
    
    // Admin news endpoints (require auth)
    $routes->post('/news', ['controller' => 'News', 'action' => 'add']);
    $routes->put('/news/:id', ['controller' => 'News', 'action' => 'edit'])->setPass(['id']);
    $routes->delete('/news/:id', ['controller' => 'News', 'action' => 'delete'])->setPass(['id']);
    $routes->post('/news/upload-image', ['controller' => 'News', 'action' => 'uploadImage']);
});

// Admin Routes for News Management
$routes->prefix('Admin', function ($routes) {
    $routes->connect('/news', ['controller' => 'News', 'action' => 'index']);
    $routes->connect('/news/add', ['controller' => 'News', 'action' => 'add']);
    $routes->connect('/news/edit/:id', ['controller' => 'News', 'action' => 'edit'])
        ->setPass(['id']);
    $routes->connect('/news/view/:id', ['controller' => 'News', 'action' => 'view'])
        ->setPass(['id']);
    $routes->connect('/news/delete/:id', ['controller' => 'News', 'action' => 'delete'])
        ->setPass(['id']);
});
```

---

## Testing

### Test API Endpoints

```bash
# Get all published news
curl http://localhost:8765/api/news

# Get specific news article
curl http://localhost:8765/api/news/1

# Get related articles
curl http://localhost:8765/api/news/1/related

# Create news (requires auth token)
curl -X POST http://localhost:8765/api/news \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "Article content here",
    "category": "Announcements",
    "published_date": "2026-01-30 10:00:00",
    "status": "published"
  }'
```

### Access Admin Panel

1. Login to your backend: `https://services.mahallu.com/admin/users/login`
2. Navigate to: `https://services.mahallu.com/admin/news`
3. Create, edit, or delete news articles

---

## Summary

You now have:

✅ Complete database schema for news
✅ API endpoints for public news viewing
✅ Admin API for news management
✅ Admin interface for creating/editing news
✅ Image upload functionality
✅ View count tracking
✅ Category and status filtering
✅ Featured news support

The frontend will automatically connect to these endpoints and display the news beautifully!
