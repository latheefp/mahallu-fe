# CakePHP Backend API - Complete Setup Guide

This guide covers ALL the API endpoints needed for your public-facing Mahallu website.

## 📋 Table of Contents

1. [Mahallu Information API](#1-mahallu-information-api)
2. [News/Information API](#2-newsinformation-api)
3. [Posters/Gallery API](#3-postersgallery-api)
4. [Complete Implementation](#4-complete-implementation)

---

## 1. Mahallu Information API

This stores and provides basic mahallu information displayed on the homepage.

### Database Migration

Create `config/Migrations/YYYYMMDDHHMMSS_CreateMahalluInfo.php`:

```php
<?php
use Migrations\AbstractMigration;

class CreateMahalluInfo extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('mahallu_info');
        
        $table->addColumn('name', 'string', [
            'limit' => 255,
            'null' => false,
        ]);
        
        $table->addColumn('name_arabic', 'string', [
            'limit' => 255,
            'null' => true,
        ]);
        
        $table->addColumn('tagline', 'string', [
            'limit' => 500,
            'null' => true,
        ]);
        
        $table->addColumn('description', 'text', [
            'null' => false,
        ]);
        
        $table->addColumn('address', 'text', [
            'null' => false,
        ]);
        
        $table->addColumn('phone', 'string', [
            'limit' => 50,
            'null' => false,
        ]);
        
        $table->addColumn('email', 'string', [
            'limit' => 255,
            'null' => false,
        ]);
        
        $table->addColumn('established_year', 'integer', [
            'null' => true,
        ]);
        
        $table->addColumn('registration_number', 'string', [
            'limit' => 100,
            'null' => true,
        ]);
        
        $table->addColumn('president_name', 'string', [
            'limit' => 255,
            'null' => true,
        ]);
        
        $table->addColumn('secretary_name', 'string', [
            'limit' => 255,
            'null' => true,
        ]);
        
        $table->addColumn('total_families', 'integer', [
            'default' => 0,
            'null' => false,
        ]);
        
        $table->addColumn('total_members', 'integer', [
            'default' => 0,
            'null' => false,
        ]);
        
        $table->addColumn('logo_url', 'string', [
            'limit' => 500,
            'null' => true,
        ]);
        
        $table->addColumn('cover_image_url', 'string', [
            'limit' => 500,
            'null' => true,
        ]);
        
        $table->addColumn('created', 'datetime', [
            'default' => 'CURRENT_TIMESTAMP',
            'null' => false,
        ]);
        
        $table->addColumn('modified', 'datetime', [
            'default' => 'CURRENT_TIMESTAMP',
            'null' => false,
        ]);
        
        $table->create();
        
        // Insert default record
        $this->execute("
            INSERT INTO mahallu_info (name, description, address, phone, email, created, modified)
            VALUES (
                'Your Mahallu Name',
                'Your mahallu description here',
                'Your address here',
                '+91 1234567890',
                'info@mahallu.org',
                NOW(),
                NOW()
            )
        ");
    }
}
```

### Model

Create `src/Model/Table/MahalluInfoTable.php`:

```php
<?php
namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class MahalluInfoTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('mahallu_info');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->addBehavior('Timestamp');
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->scalar('name')
            ->maxLength('name', 255)
            ->requirePresence('name', 'create')
            ->notEmptyString('name');

        $validator
            ->scalar('description')
            ->requirePresence('description', 'create')
            ->notEmptyString('description');

        $validator
            ->scalar('address')
            ->requirePresence('address', 'create')
            ->notEmptyString('address');

        $validator
            ->scalar('phone')
            ->requirePresence('phone', 'create')
            ->notEmptyString('phone');

        $validator
            ->email('email')
            ->requirePresence('email', 'create')
            ->notEmptyString('email');

        return $validator;
    }
    
    public function updateStatistics()
    {
        $this->loadModel('Families');
        $this->loadModel('Members');
        
        $info = $this->find()->first();
        if ($info) {
            $info->total_families = $this->Families->find()->count();
            $info->total_members = $this->Members->find()->count();
            $this->save($info);
        }
    }
}
```

### API Controller

Create `src/Controller/Api/MahalluInfoController.php`:

```php
<?php
namespace App\Controller\Api;

use App\Controller\AppController;
use Cake\Event\EventInterface;

class MahalluInfoController extends AppController
{
    public function beforeFilter(EventInterface $event)
    {
        parent::beforeFilter($event);
        
        // Allow public access to view
        $this->Authentication->addUnauthenticatedActions(['index']);
    }

    /**
     * Get mahallu information
     * GET /api/mahallu-info
     */
    public function index()
    {
        $this->request->allowMethod(['get']);
        
        $info = $this->MahalluInfo->find()->first();
        
        if (!$info) {
            $this->response = $this->response->withStatus(404);
            $this->set([
                'success' => false,
                'message' => 'Mahallu information not found'
            ]);
        } else {
            $this->set([
                'success' => true,
                'data' => $info
            ]);
        }
        
        $this->viewBuilder()->setOption('serialize', ['success', 'data', 'message']);
    }

    /**
     * Update mahallu information (Admin only)
     * PUT /api/mahallu-info
     */
    public function edit()
    {
        $this->request->allowMethod(['put', 'patch']);
        
        $info = $this->MahalluInfo->find()->first();
        
        if (!$info) {
            $info = $this->MahalluInfo->newEmptyEntity();
        }
        
        $info = $this->MahalluInfo->patchEntity($info, $this->request->getData());
        
        if ($this->MahalluInfo->save($info)) {
            $this->set([
                'success' => true,
                'message' => 'Mahallu information updated successfully',
                'data' => $info
            ]);
        } else {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Failed to update mahallu information',
                'errors' => $info->getErrors()
            ]);
        }
        
        $this->viewBuilder()->setOption('serialize', ['success', 'message', 'data', 'errors']);
    }
}
```

### Admin Controller

Create `src/Controller/Admin/MahalluInfoController.php`:

```php
<?php
namespace App\Controller\Admin;

use App\Controller\AppController;

class MahalluInfoController extends AppController
{
    public function edit()
    {
        $info = $this->MahalluInfo->find()->first();
        
        if (!$info) {
            $info = $this->MahalluInfo->newEmptyEntity();
        }
        
        if ($this->request->is(['patch', 'post', 'put'])) {
            $info = $this->MahalluInfo->patchEntity($info, $this->request->getData());
            
            if ($this->MahalluInfo->save($info)) {
                $this->Flash->success(__('Mahallu information has been updated.'));
                return $this->redirect(['action' => 'edit']);
            }
            $this->Flash->error(__('Failed to update mahallu information.'));
        }
        
        $this->set(compact('info'));
    }
    
    public function updateStatistics()
    {
        $this->request->allowMethod(['post']);
        
        $this->MahalluInfo->updateStatistics();
        
        $this->Flash->success(__('Statistics updated successfully.'));
        return $this->redirect(['action' => 'edit']);
    }
}
```

### Admin View

Create `templates/Admin/MahalluInfo/edit.php`:

```php
<div class="mahallu-info form content">
    <?= $this->Form->create($info, ['type' => 'file']) ?>
    <fieldset>
        <legend><?= __('Edit Mahallu Information') ?></legend>
        <div class="row">
            <div class="col-md-6">
                <?php
                    echo $this->Form->control('name', ['required' => true, 'label' => 'Mahallu Name']);
                    echo $this->Form->control('name_arabic', ['label' => 'Name (Arabic)']);
                    echo $this->Form->control('tagline');
                    echo $this->Form->control('description', ['type' => 'textarea', 'rows' => 4]);
                ?>
            </div>
            <div class="col-md-6">
                <?php
                    echo $this->Form->control('address', ['type' => 'textarea', 'rows' => 3]);
                    echo $this->Form->control('phone');
                    echo $this->Form->control('email');
                    echo $this->Form->control('established_year', ['type' => 'number']);
                    echo $this->Form->control('registration_number');
                ?>
            </div>
        </div>
        
        <h4>Leadership</h4>
        <div class="row">
            <div class="col-md-6">
                <?php
                    echo $this->Form->control('president_name');
                    echo $this->Form->control('secretary_name');
                ?>
            </div>
            <div class="col-md-6">
                <?php
                    echo $this->Form->control('total_families', ['type' => 'number', 'readonly' => true]);
                    echo $this->Form->control('total_members', ['type' => 'number', 'readonly' => true]);
                ?>
                <p class="help-text">
                    <?= $this->Form->postLink('Update Statistics', ['action' => 'updateStatistics'], [
                        'class' => 'button',
                        'confirm' => 'Update family and member counts?'
                    ]) ?>
                </p>
            </div>
        </div>
        
        <h4>Images</h4>
        <div class="row">
            <div class="col-md-6">
                <?php
                    echo $this->Form->control('logo_url', ['label' => 'Logo URL']);
                    echo $this->Form->control('cover_image_url', ['label' => 'Cover Image URL']);
                ?>
            </div>
        </div>
    </fieldset>
    <?= $this->Form->button(__('Save')) ?>
    <?= $this->Form->end() ?>
</div>
```

---

## 2. News/Information API

**(Already covered in BACKEND_NEWS_SETUP.md)**

Make sure you have:
- News table and model
- API endpoints for listing and viewing news
- Featured news endpoint
- Admin panel for creating/editing

---

## 3. Posters/Gallery API

For uploading and displaying event posters and announcements.

### Database Migration

Create `config/Migrations/YYYYMMDDHHMMSS_CreatePosters.php`:

```php
<?php
use Migrations\AbstractMigration;

class CreatePosters extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('posters');
        
        $table->addColumn('title', 'string', [
            'limit' => 255,
            'null' => false,
        ]);
        
        $table->addColumn('description', 'text', [
            'null' => true,
        ]);
        
        $table->addColumn('image_url', 'string', [
            'limit' => 500,
            'null' => false,
        ]);
        
        $table->addColumn('category', 'string', [
            'limit' => 100,
            'null' => true,
        ]);
        
        $table->addColumn('event_date', 'date', [
            'null' => true,
        ]);
        
        $table->addColumn('status', 'string', [
            'limit' => 20,
            'default' => 'draft',
            'null' => false,
        ]);
        
        $table->addColumn('view_count', 'integer', [
            'default' => 0,
            'null' => false,
        ]);
        
        $table->addColumn('user_id', 'integer', [
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
        $table->addIndex(['event_date']);
        
        $table->create();
    }
}
```

### Model

Create `src/Model/Table/PostersTable.php`:

```php
<?php
namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class PostersTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('posters');
        $this->setDisplayField('title');
        $this->setPrimaryKey('id');

        $this->addBehavior('Timestamp');

        $this->belongsTo('Users', [
            'foreignKey' => 'user_id',
            'joinType' => 'INNER',
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->scalar('title')
            ->maxLength('title', 255)
            ->requirePresence('title', 'create')
            ->notEmptyString('title');

        $validator
            ->scalar('image_url')
            ->requirePresence('image_url', 'create')
            ->notEmptyString('image_url');

        $validator
            ->scalar('status')
            ->inList('status', ['draft', 'published', 'archived'])
            ->requirePresence('status', 'create');

        return $validator;
    }

    public function findPublished($query)
    {
        return $query->where(['Posters.status' => 'published']);
    }
}
```

### API Controller

Create `src/Controller/Api/PostersController.php`:

```php
<?php
namespace App\Controller\Api;

use App\Controller\AppController;
use Cake\Event\EventInterface;

class PostersController extends AppController
{
    public function beforeFilter(EventInterface $event)
    {
        parent::beforeFilter($event);
        
        $this->Authentication->addUnauthenticatedActions(['index', 'view']);
    }

    /**
     * Get all published posters
     * GET /api/posters
     */
    public function index()
    {
        $this->request->allowMethod(['get']);
        
        $page = (int) $this->request->getQuery('page', 1);
        $limit = (int) $this->request->getQuery('limit', 20);
        
        $query = $this->Posters->find('published')
            ->order(['Posters.created' => 'DESC']);
        
        $total = $query->count();
        
        $posters = $query
            ->limit($limit)
            ->page($page)
            ->toArray();
        
        $this->set([
            'success' => true,
            'data' => $posters,
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
     * Get single poster
     * GET /api/posters/:id
     */
    public function view($id)
    {
        $this->request->allowMethod(['get']);
        
        $poster = $this->Posters->get($id);
        
        $this->set([
            'success' => true,
            'data' => $poster
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'data']);
    }

    /**
     * Create poster (Admin only)
     * POST /api/posters
     */
    public function add()
    {
        $this->request->allowMethod(['post']);
        
        $user = $this->request->getAttribute('identity');
        
        $data = $this->request->getData();
        $data['user_id'] = $user['id'];
        
        $poster = $this->Posters->newEntity($data);
        
        if ($this->Posters->save($poster)) {
            $this->set([
                'success' => true,
                'message' => 'Poster created successfully',
                'data' => $poster
            ]);
        } else {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Failed to create poster',
                'errors' => $poster->getErrors()
            ]);
        }
        $this->viewBuilder()->setOption('serialize', ['success', 'message', 'data', 'errors']);
    }

    /**
     * Delete poster (Admin only)
     * DELETE /api/posters/:id
     */
    public function delete($id)
    {
        $this->request->allowMethod(['delete']);
        
        $poster = $this->Posters->get($id);
        
        if ($this->Posters->delete($poster)) {
            $this->set([
                'success' => true,
                'message' => 'Poster deleted successfully'
            ]);
        } else {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Failed to delete poster'
            ]);
        }
        $this->viewBuilder()->setOption('serialize', ['success', 'message']);
    }
}
```

### Admin Controller

Create `src/Controller/Admin/PostersController.php`:

```php
<?php
namespace App\Controller\Admin;

use App\Controller\AppController;

class PostersController extends AppController
{
    public function index()
    {
        $this->paginate = [
            'order' => ['Posters.created' => 'DESC'],
            'limit' => 20
        ];
        
        $posters = $this->paginate($this->Posters);
        
        $this->set(compact('posters'));
    }

    public function add()
    {
        $poster = $this->Posters->newEmptyEntity();
        
        if ($this->request->is('post')) {
            $data = $this->request->getData();
            $data['user_id'] = $this->Authentication->getIdentity()->id;
            
            $poster = $this->Posters->patchEntity($poster, $data);
            
            if ($this->Posters->save($poster)) {
                $this->Flash->success(__('The poster has been saved.'));
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error(__('The poster could not be saved.'));
        }
        
        $this->set(compact('poster'));
    }

    public function edit($id = null)
    {
        $poster = $this->Posters->get($id);
        
        if ($this->request->is(['patch', 'post', 'put'])) {
            $poster = $this->Posters->patchEntity($poster, $this->request->getData());
            
            if ($this->Posters->save($poster)) {
                $this->Flash->success(__('The poster has been saved.'));
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error(__('The poster could not be saved.'));
        }
        
        $this->set(compact('poster'));
    }

    public function delete($id = null)
    {
        $this->request->allowMethod(['post', 'delete']);
        $poster = $this->Posters->get($id);
        
        if ($this->Posters->delete($poster)) {
            $this->Flash->success(__('The poster has been deleted.'));
        } else {
            $this->Flash->error(__('The poster could not be deleted.'));
        }
        
        return $this->redirect(['action' => 'index']);
    }
}
```

---

## 4. Complete Implementation

### Routes Configuration

Add to `config/routes.php`:

```php
// API Routes
$routes->prefix('Api', function ($routes) {
    $routes->setExtensions(['json']);
    
    // Mahallu Info (public read, admin write)
    $routes->connect('/mahallu-info', ['controller' => 'MahalluInfo', 'action' => 'index']);
    $routes->put('/mahallu-info', ['controller' => 'MahalluInfo', 'action' => 'edit']);
    
    // Posters (public read, admin write)
    $routes->connect('/posters', ['controller' => 'Posters', 'action' => 'index']);
    $routes->connect('/posters/:id', ['controller' => 'Posters', 'action' => 'view'])
        ->setPass(['id']);
    $routes->post('/posters', ['controller' => 'Posters', 'action' => 'add']);
    $routes->delete('/posters/:id', ['controller' => 'Posters', 'action' => 'delete'])
        ->setPass(['id']);
    
    // News (from previous setup)
    $routes->connect('/news', ['controller' => 'News', 'action' => 'index']);
    $routes->connect('/news/:id', ['controller' => 'News', 'action' => 'view'])
        ->setPass(['id']);
});

// Admin Routes
$routes->prefix('Admin', function ($routes) {
    // Mahallu Info
    $routes->connect('/mahallu-info', ['controller' => 'MahalluInfo', 'action' => 'edit']);
    $routes->post('/mahallu-info/update-statistics', 
        ['controller' => 'MahalluInfo', 'action' => 'updateStatistics']);
    
    // Posters
    $routes->connect('/posters', ['controller' => 'Posters', 'action' => 'index']);
    $routes->connect('/posters/add', ['controller' => 'Posters', 'action' => 'add']);
    $routes->connect('/posters/edit/:id', ['controller' => 'Posters', 'action' => 'edit'])
        ->setPass(['id']);
    $routes->connect('/posters/delete/:id', ['controller' => 'Posters', 'action' => 'delete'])
        ->setPass(['id']);
});
```

### Run Migrations

```bash
bin/cake migrations migrate
```

### Quick Setup Steps

1. **Run migrations**:
   ```bash
   bin/cake migrations migrate
   ```

2. **Update mahallu info** in admin:
   - Visit: `https://services.mahallu.com/admin/mahallu-info`
   - Fill in all details
   - Save

3. **Create news articles** in admin:
   - Visit: `https://services.mahallu.com/admin/news`
   - Add articles, mark some as "Featured"

4. **Upload posters** in admin:
   - Visit: `https://services.mahallu.com/admin/posters`
   - Add poster details and image URLs
   - Set status to "Published"

5. **Test frontend**:
   - Homepage shows mahallu info ✓
   - News page shows articles ✓
   - Posters page shows gallery ✓

---

## Summary

You now have complete API endpoints for:

✅ **Mahallu Information** - Name, description, contact, leadership
✅ **News System** - Articles with categories and featured support
✅ **Posters Gallery** - Event posters and announcements

**All data is managed in CakePHP admin and displayed beautifully on the frontend!**
